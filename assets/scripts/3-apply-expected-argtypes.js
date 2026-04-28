#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const recast = require('recast');
const { namedTypes: n, builders: b } = recast.types;

const ROOT = path.resolve(__dirname, '..');
const reportPath = path.join(ROOT, 'stories-argtypes-report.json');

function applyToStory(storyFile, expectedProps) {
  const src = fs.readFileSync(storyFile, 'utf8');
  const ast = recast.parse(src, { parser: require('recast/parsers/babel') });
  let modified = false;

  recast.visit(ast, {
    visitExportDefaultDeclaration(pathExp) {
      const decl = pathExp.node.declaration;
      if (n.ObjectExpression.check(decl)) {
        let argTypesProp = decl.properties.find((p) => p.key && (p.key.name === 'argTypes' || p.key.value === 'argTypes'));
        if (!argTypesProp) {
          argTypesProp = b.property('init', b.identifier('argTypes'), b.objectExpression([]));
          // insert near component/title if possible
          let idx = -1;
          for (let i = 0; i < decl.properties.length; i++) {
            const k = decl.properties[i].key && (decl.properties[i].key.name || decl.properties[i].key.value);
            if (k === 'component' || k === 'title') { idx = i; break; }
          }
          if (idx >= 0) decl.properties.splice(idx + 1, 0, argTypesProp);
          else decl.properties.push(argTypesProp);
          modified = true;
        }

        const argObj = argTypesProp.value;
        if (!n.ObjectExpression.check(argObj)) return false;

        // collect existing props (keep their AST nodes) and preserve their order
        const existing = {};
        const existingOrder = [];
        for (const prop of argObj.properties) {
          const name = prop.key && (prop.key.name || prop.key.value);
          if (name) {
            existing[name] = prop;
            existingOrder.push(name);
          }
        }

        // Build new properties list: keep existing props in their original order
        // (but only those that are expected), then append missing expected props.
        const expectedSet = new Set(expectedProps);
        const outProps = [];

        for (const name of existingOrder) {
          if (expectedSet.has(name)) outProps.push(existing[name]);
        }

        for (const pName of expectedProps) {
          if (!existing[pName]) {
            // add minimal entry (preserve existing behavior by NOT adding a control)
            const newObj = b.objectExpression([
              b.property('init', b.identifier('description'), b.literal('')),
            ]);
            const newProp = b.property('init', b.identifier(pName), newObj);
            outProps.push(newProp);
          }
        }

        // detect if ordering/pruning/additions changed so we set `modified`
        const oldNames = argObj.properties.map((p) => p.key && (p.key.name || p.key.value));
        const newNames = outProps.map((p) => p.key && (p.key.name || p.key.value));
        if (JSON.stringify(oldNames) !== JSON.stringify(newNames)) modified = true;

        // replace with pruned/ordered set
        argObj.properties = outProps;
      }
      return false;
    },
  });

  if (modified) {
    let newSrc = recast.print(ast).code;
    // Collapse accidental double blank lines between object properties
    // e.g. "},\n\n    userAbilities:" -> "},\n    userAbilities:"
    newSrc = newSrc.replace(/},\n\s*\n(\s*(?:['"`]?\w+['"`]?\s*:))/g, '},\n$1');
    fs.writeFileSync(storyFile, newSrc, 'utf8');
  }
  return modified;
}

function main() {
  if (!fs.existsSync(reportPath)) {
    console.error('Missing report:', reportPath);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  let modified = 0;
  for (const item of report) {
    const story = path.join(ROOT, item.story);
    if (!fs.existsSync(story)) continue;
    const expected = item.expectedProps || [];
    const ok = applyToStory(story, expected);
    if (ok) modified += 1;
  }
  console.log('Modified', modified, 'story files');
}

main();
