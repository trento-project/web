#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STORIES_DIR = path.join(ROOT, 'js');

let docgen;
let tsParser;
try {
  docgen = require('react-docgen');
} catch (e) {
  docgen = null;
}
try {
  tsParser = require('react-docgen-typescript').withDefaultConfig();
} catch (e) {
  tsParser = null;
}

async function findStoryFiles(dir) {
  const results = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...(await findStoryFiles(full)));
    } else if (/\.stories\./.test(ent.name)) {
      results.push(full);
    }
  }
  return results;
}

function extractArgTypesKeys(content) {
  const keys = new Set();
  let idx = 0;
  let guard = 0;
  while ((idx = content.indexOf('argTypes', idx)) !== -1) {
    guard += 1;
    if (guard > 5000) break;
    const braceStart = content.indexOf('{', idx);
    if (braceStart === -1) break;
    // find matching closing brace
    let depth = 0;
    let i = braceStart;
    let found = false;
    while (i < content.length) {
      const ch = content[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      i += 1;
      if (depth === 0) { found = true; break; }
    }
    if (!found) break;
    const body = content.slice(braceStart + 1, i - 1);
    // scan body and collect top-level keys (ignore nested object keys)
    let innerDepth = 0;
    let j = 0;
    while (j < body.length) {
      const ch2 = body[j];
      if (ch2 === '{') { innerDepth += 1; j += 1; continue; }
      if (ch2 === '}') { innerDepth = Math.max(0, innerDepth - 1); j += 1; continue; }
      if (innerDepth === 0) {
        const rest = body.slice(j);
        const keyMatch = rest.match(/^\s*([A-Za-z0-9_\-]+)\s*:/);
        if (keyMatch) {
          keys.add(keyMatch[1].replace(/-/g, '_'));
          j += keyMatch[0].length;
          continue;
        }
      }
      j += 1;
    }
    idx = i;
  }
  return Array.from(keys);
}

function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+([A-Za-z0-9_{}\s,*]+)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRegex.exec(content))) {
    const spec = m[1].trim();
    const impPath = m[2];
    if (impPath === '.' || impPath.startsWith('./') || impPath.startsWith('../')) {
      imports.push({ spec, path: impPath });
    }
  }
  return imports;
}

function parseImportSpecifiers(spec) {
  const map = {};
  if (spec.startsWith('{')) {
    const inner = spec.replace(/^{|}$/g, '');
    inner.split(',').forEach((part) => {
      const name = part.split(' as ')[0].trim();
      if (name) map[name] = true;
    });
  } else {
    const name = spec.split(',')[0].trim();
    if (name) map[name] = true;
  }
  return Object.keys(map);
}

function findDefaultComponentName(content) {
  const defRegex = /component\s*:\s*([A-Za-z0-9_]+)/;
  const m = defRegex.exec(content);
  return m ? m[1] : null;
}

function resolveImportFile(storyFile, importPath) {
  const base = path.resolve(path.dirname(storyFile), importPath);
  const candidates = [
    `${base}.jsx`,
    `${base}.js`,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.jsx'),
    path.join(base, 'index.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function followReexport(filePath) {
  try {
    const src = fs.readFileSync(filePath, 'utf8');
    // export { default } from './Table';
    let m = src.match(/export\s*\{\s*default\s*\}\s*from\s*['"]([^'"]+)['"]/);
    if (m) {
      const resolved = resolveImportFile(filePath, m[1]);
      if (resolved) return resolved;
    }
    // export * from './Table';
    m = src.match(/export\s+\*\s+from\s+['"]([^'"]+)['"]/);
    if (m) {
      const resolved = resolveImportFile(filePath, m[1]);
      if (resolved) return resolved;
    }
    // import X from './Table'; export default X;
    m = src.match(/import\s+([A-Za-z0-9_]+)(?:\s*,\s*\{[^\}]*\})?\s+from\s+['"]([^'"]+)['"];?[\s\S]*export\s+default\s+\1/);
    if (m) {
      const resolved = resolveImportFile(filePath, m[2]);
      if (resolved) return resolved;
    }
  } catch (e) {
    return null;
  }
  return null;
}

function extractPropsFromComponent(content) {
  const props = new Set();
  let source = null;
  // propTypes
  const propTypesRegex = /[A-Za-z0-9_]+\.propTypes\s*=\s*{([\s\S]*?)}/g;
  let m;
  if ((m = propTypesRegex.exec(content))) {
    source = 'propTypes';
    const body = m[1];
    const keyRegex = /([A-Za-z0-9_]+)\s*:/g;
    let k;
    while ((k = keyRegex.exec(body))) props.add(k[1]);
  }
  // defaultProps (only used if propTypes absent)
  const defaultPropsRegex = /[A-Za-z0-9_]+\.defaultProps\s*=\s*{([\s\S]*?)}/g;
  if (!source && (m = defaultPropsRegex.exec(content))) {
    source = 'defaultProps';
    const body = m[1];
    const keyRegex = /([A-Za-z0-9_]+)\s*:/g;
    let k;
    while ((k = keyRegex.exec(body))) props.add(k[1]);
  }
  // destructured function params
  const destructureRegexes = [
    /export\s+default\s+function\s*[A-Za-z0-9_]*\s*\(\s*{([\s\S]*?)}\s*\)/g,
    /function\s+[A-Za-z0-9_]+\s*\(\s*{([\s\S]*?)}\s*\)/g,
    /(?:const|let|var)\s+[A-Za-z0-9_]+\s*=\s*\(\s*{([\s\S]*?)}\s*\)\s*=>/g,
  ];
  if (!source) {
    for (const rx of destructureRegexes) {
      while ((m = rx.exec(content))) {
        source = 'destructure';
        const body = m[1];
        const keyRegex = /(?:^|,)\s*([A-Za-z0-9_]+)\s*(?:=|,|$)/g;
        let k;
        while ((k = keyRegex.exec(body))) props.add(k[1]);
        // also catch `name = default` patterns that may not be matched due to newlines
        const assignRegex = /([A-Za-z0-9_]+)\s*=/g;
        let a;
        while ((a = assignRegex.exec(body))) props.add(a[1]);
      }
    }
  }
  return { props: Array.from(props), source: source || 'regex' };
}

async function scan() {
  const files = await findStoryFiles(STORIES_DIR);
  const report = [];
  for (const f of files) {
    const content = await fs.promises.readFile(f, 'utf8');
    const argTypesKeys = extractArgTypesKeys(content);
    if (!argTypesKeys || argTypesKeys.length === 0) continue; // ignore stories without argTypes
    const importObjs = extractImports(content);
    const defaultComp = findDefaultComponentName(content);
    const importMap = {};
    for (const imp of importObjs) {
      const names = parseImportSpecifiers(imp.spec);
      for (const n of names) importMap[n] = imp.path;
    }
    let targetPath = null;
    // Choose best import candidate: prefer ones docgen/tsdocgen can parse or AST-detected props
    if (defaultComp && importMap[defaultComp]) {
      targetPath = resolveImportFile(f, importMap[defaultComp]);
    } else if (importObjs.length > 0) {
      let best = { score: -1, path: null };
      for (const imp of importObjs) {
        const cand = resolveImportFile(f, imp.path);
        if (!cand) continue;
        try {
          const src = fs.readFileSync(cand, 'utf8');
          const ext = path.extname(cand).toLowerCase();
          let score = 0;
          try {
            if ((ext === '.tsx' || ext === '.ts') && tsParser) {
              const parsed = tsParser.parse(cand);
              if (parsed && parsed.length) {
                const props = Object.keys(parsed[0].props || {});
                score += props.length ? 20 : 10;
              }
            } else if (docgen) {
              const info = docgen.parse(src);
              const props = Object.keys(info.props || {});
              score += props.length ? 20 : 10;
            }
          } catch (e) {
            // docgen failed, fall through to AST extraction
          }
          // AST fallback
          const res = extractPropsFromComponent(src);
          if (res && res.props && res.props.length) score += 8;
          if (score > best.score) best = { score, path: cand };
        } catch (e) {
          // unreadable, skip
        }
      }
      if (best.path) targetPath = best.path;
      else targetPath = resolveImportFile(f, importObjs[0].path);
    }
    if (!targetPath) continue; // skip unresolved
    // If target is an index/re-export file, try to follow re-exports to actual implementation
    try {
      const follow = followReexport(targetPath);
      if (follow) targetPath = follow;
    } catch (e) {
      // ignore
    }
    let expectedProps = [];
    let propsSource = 'unknown';
    try {
      const compContent = await fs.promises.readFile(targetPath, 'utf8');
      // prefer react-docgen / react-docgen-typescript when available
      let propsFromDoc = [];
      const ext = path.extname(targetPath).toLowerCase();
      try {
        if ((ext === '.tsx' || ext === '.ts') && tsParser) {
          const parsed = tsParser.parse(targetPath);
          if (parsed && parsed.length) {
            propsFromDoc = Object.keys(parsed[0].props || {});
          }
        } else if (docgen) {
          const info = docgen.parse(compContent);
          propsFromDoc = Object.keys(info.props || {});
        }
      } catch (e) {
        // ignore docgen errors and fallback
        propsFromDoc = [];
      }

      if (propsFromDoc && propsFromDoc.length) {
        expectedProps = propsFromDoc;
        propsSource = ((ext === '.tsx' || ext === '.ts') && tsParser) ? 'tsdocgen' : 'docgen';
      } else {
        // fallback: try AST-based destructured param extraction (handles modern syntax)
        try {
          const recast = require('recast');
          const ast = recast.parse(compContent, { parser: require('recast/parsers/babel') });
          const propsFound = {};
          // Robust traversal: handle named function declarations, variable declarators (arrow funcs),
          // and default export functions/identifiers. Capture ObjectPattern params and AssignmentPattern defaults.
          recast.types.visit(ast, {
            visitFunctionDeclaration(pathFn) {
              const p0 = pathFn.node.params && pathFn.node.params[0];
              if (p0 && (p0.type === 'ObjectPattern' || p0.type === 'ObjectExpression')) {
                for (const p of p0.properties || []) {
                  const name = (p.key && (p.key.name || p.key.value)) || null;
                  if (name) propsFound[name] = true;
                }
              }
              this.traverse(pathFn);
            },
            visitVariableDeclarator(pathVar) {
              const init = pathVar.node.init;
              if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
                const p0 = init.params && init.params[0];
                if (p0 && p0.type === 'ObjectPattern') {
                  for (const p of p0.properties || []) {
                    const name = (p.key && (p.key.name || p.key.value)) || null;
                    if (name) propsFound[name] = true;
                  }
                }
              }
              this.traverse(pathVar);
            },
            visitExportDefaultDeclaration(pathExp) {
              const decl = pathExp.node.declaration;
              if (decl && (decl.type === 'FunctionDeclaration' || decl.type === 'FunctionExpression' || decl.type === 'ArrowFunctionExpression')) {
                const p0 = decl.params && decl.params[0];
                if (p0 && p0.type === 'ObjectPattern') {
                  for (const p of p0.properties || []) {
                    const name = (p.key && (p.key.name || p.key.value)) || null;
                    if (name) propsFound[name] = true;
                  }
                }
              } else if (decl && decl.type === 'Identifier') {
                const idName = decl.name;
                // look for the identifier declaration elsewhere
                recast.types.visit(ast, {
                  visitFunctionDeclaration(innerPath) {
                    if (innerPath.node.id && innerPath.node.id.name === idName) {
                      const p0 = innerPath.node.params && innerPath.node.params[0];
                      if (p0 && p0.type === 'ObjectPattern') {
                        for (const p of p0.properties || []) {
                          const name = (p.key && (p.key.name || p.key.value)) || null;
                          if (name) propsFound[name] = true;
                        }
                      }
                    }
                    this.traverse(innerPath);
                  },
                  visitVariableDeclarator(innerVar) {
                    if (innerVar.node.id && innerVar.node.id.name === idName) {
                      const init = innerVar.node.init;
                      if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
                        const p0 = init.params && init.params[0];
                        if (p0 && p0.type === 'ObjectPattern') {
                          for (const p of p0.properties || []) {
                            const name = (p.key && (p.key.name || p.key.value)) || null;
                            if (name) propsFound[name] = true;
                          }
                        }
                      }
                    }
                    this.traverse(innerVar);
                  },
                });
              }
              this.traverse(pathExp);
            },
          });
          expectedProps = Object.keys(propsFound);
          propsSource = expectedProps.length ? 'ast' : propsSource;
          if (!expectedProps.length) {
            const res = extractPropsFromComponent(compContent);
            expectedProps = res.props;
            propsSource = res.source || propsSource;
          }
        } catch (e) {
          const res = extractPropsFromComponent(compContent);
          expectedProps = res.props;
          propsSource = res.source || propsSource;
        }
      }
    } catch (e) {
      continue;
    }
    const extra = argTypesKeys.filter((p) => !expectedProps.includes(p));
    const missing = expectedProps.filter((p) => !argTypesKeys.includes(p));
    if (extra.length || missing.length) {
      report.push({
        story: path.relative(ROOT, f),
        component: path.relative(ROOT, targetPath),
        argTypes: argTypesKeys,
        expectedProps,
        extra,
        missing,
        propsSource,
      });
    }
  }
  const out = path.join(ROOT, 'stories-argtypes-report.json');
  await fs.promises.writeFile(out, JSON.stringify(report, null, 2));
  console.log('Wrote', out);
  console.log(JSON.stringify(report, null, 2));
}

scan().catch((e) => { console.error(e); process.exit(1); });
