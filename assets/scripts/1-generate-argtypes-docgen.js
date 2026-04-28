#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const reportPath = path.join(ROOT, 'stories-argtypes-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('Report not found:', reportPath);
  process.exit(1);
}

let docgen;
let tsParser;
try {
  docgen = require('react-docgen');
} catch (e) {
  console.error('react-docgen not installed. Run: npm install --save-dev react-docgen');
  process.exit(1);
}
try {
  tsParser = require('react-docgen-typescript').withDefaultConfig();
} catch (e) {
  // ok if not installed; we'll skip TS files
  tsParser = null;
}

function mapTypeToControl(prop) {
  // prop may be the raw descriptor from react-docgen / react-docgen-typescript
  if (!prop) return { type: 'object' };
  const typeName = (prop && prop.type && prop.type.name) || (prop && prop.flowType && prop.flowType.name) || (prop && prop.tsType && prop.tsType.name) || '';
  const raw = (typeName || '').toLowerCase();

  // handle react-docgen enum: prop.type.value -> array of { value }
  if (prop.type && prop.type.name === 'enum' && Array.isArray(prop.type.value)) {
    const options = prop.type.value.map((v) => (v && (v.value || v.name) || v)).map((s) => String(s).replace(/^['"]|['"]$/g, '')).filter(Boolean);
    return { type: 'select', options };
  }

  // flow union
  if (prop.flowType && prop.flowType.name === 'union' && Array.isArray(prop.flowType.elements)) {
    const options = prop.flowType.elements.map((e) => (e && (e.value || e.raw) || e)).map(String).filter(Boolean);
    return { type: 'select', options };
  }

  // typescript union (react-docgen-typescript uses tsType)
  if (prop.tsType && prop.tsType.name === 'union' && Array.isArray(prop.tsType.elements)) {
    const options = prop.tsType.elements.map((e) => (e && (e.name || e.value) || e)).map(String).filter(Boolean);
    return { type: 'select', options };
  }

  if (raw === 'string') return { type: 'text' };
  if (raw === 'bool' || raw === 'boolean') return { type: 'boolean' };
  if (raw === 'number' || raw === 'int' || raw === 'float' || raw === 'numeric') return { type: 'number' };
  if (raw === 'array' || raw === 'object' || raw === 'shape' || raw === 'any') return { type: 'object' };
  if (raw.startsWith('enum') || raw.startsWith('union')) return { type: 'select' };

  return { type: 'object' };
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const out = [];

// build initial set of components from report
const compsSet = new Set(report.map((r) => r.component));

// walk assets/js to find all component files (skip stories)
function walkDir(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      walkDir(p, filelist);
    } else if (st.isFile()) {
      // skip story files
      if (/\.stories\.(jsx|tsx|js|ts)$/.test(f)) continue;
      if (/\.(jsx|tsx|js|ts)$/.test(f)) {
        // store relative path from ROOT
        const rel = path.relative(ROOT, p).split(path.sep).join('/');
        compsSet.add(rel);
      }
    }
  }
  return filelist;
}

const assetsDir = path.join(ROOT, 'js');
if (fs.existsSync(assetsDir)) walkDir(assetsDir);

for (const compRel of Array.from(compsSet)) {
  // find a corresponding story file if any
  const compPath = path.join(ROOT, compRel);
  if (!fs.existsSync(compPath)) continue;
  const ext = path.extname(compPath).toLowerCase();
  let props = {};
  try {
    if ((ext === '.tsx' || ext === '.ts') && tsParser) {
      const parsed = tsParser.parse(compPath);
      if (parsed && parsed.length) {
        const pmap = parsed[0].props || {};
        for (const [k, v] of Object.entries(pmap)) {
          props[k] = { __raw: v, description: v.description || '', type: v.type && v.type.name ? v.type.name : '', defaultValue: v.defaultValue && v.defaultValue.value };
        }
      }
    } else {
      const src = fs.readFileSync(compPath, 'utf8');
      const info = docgen.parse(src);
      const pmap = info.props || {};
      for (const [k, v] of Object.entries(pmap)) {
        props[k] = { __raw: v, description: v.description || '', type: v.type && v.type.name ? v.type.name : (v.flowType && v.flowType.name) || '', defaultValue: v.defaultValue && v.defaultValue.value };
      }
    }
  } catch (e) {
    // skip parse errors but continue
    console.error('docgen parse error for', compRel, e && e.message);
  }
  // fallback: if docgen didn't find props, try to parse destructured params from the component
  if (Object.keys(props).length === 0) {
    try {
      const recast = require('recast');
      const src = fs.readFileSync(compPath, 'utf8');
      const ast = recast.parse(src, { parser: require('recast/parsers/babel') });
      let compName = null;
      // find default export identifier name
      recast.types.visit(ast, {
        visitExportDefaultDeclaration(pathExp) {
          const decl = pathExp.node.declaration;
          if (decl && decl.type === 'Identifier') compName = decl.name;
          if (decl && (decl.type === 'FunctionDeclaration' || decl.type === 'ArrowFunctionExpression')) {
            // anonymous default export function; inspect params directly
            if (decl.params && decl.params[0] && decl.params[0].type === 'ObjectPattern') {
              const propsFound = {};
              for (const p of decl.params[0].properties) {
                if (p.type === 'Property' || p.type === 'ObjectProperty') {
                  const name = (p.key && (p.key.name || p.key.value)) || null;
                  let defaultValue = null;
                  if (p.value && p.value.type === 'AssignmentPattern') {
                    const right = p.value.right;
                    if (right.type === 'Literal') defaultValue = right.value;
                  }
                  propsFound[name] = { description: '', type: '', defaultValue };
                }
              }
              props = propsFound;
            }
          }
          this.traverse(pathExp);
        },
      });

      if (compName) {
        // find function declaration or variable declarator matching compName
        recast.types.visit(ast, {
          visitFunctionDeclaration(pathFn) {
            if (pathFn.node.id && pathFn.node.id.name === compName) {
              const p0 = pathFn.node.params && pathFn.node.params[0];
              if (p0 && p0.type === 'ObjectPattern') {
                const propsFound = {};
                for (const p of p0.properties) {
                  if (p.type === 'Property' || p.type === 'ObjectProperty') {
                      const name = (p.key && (p.key.name || p.key.value)) || null;
                    let defaultValue = null;
                    if (p.value && p.value.type === 'AssignmentPattern') {
                      const right = p.value.right;
                      if (right.type === 'Literal') defaultValue = right.value;
                    }
                    propsFound[name] = { description: '', type: '', defaultValue };
                  }
                }
                props = propsFound;
              }
            }
            this.traverse(pathFn);
          },
          visitVariableDeclarator(pathVar) {
            if (pathVar.node.id && pathVar.node.id.name === compName) {
              const init = pathVar.node.init;
              if (init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression')) {
                const p0 = init.params && init.params[0];
                if (p0 && p0.type === 'ObjectPattern') {
                  const propsFound = {};
                  for (const p of p0.properties) {
                    if (p.type === 'Property' || p.type === 'ObjectProperty') {
                      const name = (p.key && (p.key.name || p.key.value)) || null;
                      let defaultValue = null;
                      if (p.value && p.value.type === 'AssignmentPattern') {
                        const right = p.value.right;
                        if (right.type === 'Literal') defaultValue = right.value;
                      }
                      propsFound[name] = { description: '', type: '', defaultValue };
                    }
                  }
                  props = propsFound;
                }
              }
            }
            this.traverse(pathVar);
          },
        });
      }
    } catch (e) {
      // ignore fallback errors
    }
  }
  const suggestions = {};
  for (const [k, v] of Object.entries(props)) {
    suggestions[k] = {
      description: v.description || '',
      control: mapTypeToControl(v.__raw || v),
      type: v.type || '',
      defaultValue: v.defaultValue || null,
    };
  }
  // find story file candidates in same directory
  let storyRel = null;
  try {
    const dir = path.dirname(compPath);
    const base = path.basename(compPath, ext);
    const candidates = [
      `${base}.stories${ext}`,
      `${base}.stories.jsx`,
      `${base}.stories.tsx`,
      `${base}.stories.js`,
      `${base}.stories.ts`,
    ];
    for (const c of candidates) {
      const p = path.join(dir, c);
      if (fs.existsSync(p)) { storyRel = path.relative(ROOT, p).split(path.sep).join('/'); break; }
    }
  } catch (e) {}

  out.push({ story: storyRel, component: compRel, suggestions });
}

const outPath = path.join(ROOT, 'stories-argtypes-docgen.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', outPath);
