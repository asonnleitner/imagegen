const pkg = await Bun.file('package.json').json()
const [major, minor, patch] = pkg.version.split('.').map(Number)

pkg.version = `${major}.${minor}.${patch + 1}`

await Bun.write('package.json', `${JSON.stringify(pkg, null, 2)}\n`)

console.log(`v${pkg.version}`)

export {}
