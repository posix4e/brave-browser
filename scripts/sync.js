const path = require('path')
const program = require('commander');
const fs = require('fs-extra')
const config = require('../lib/config')
const util = require('../lib/util')

program
  .version(process.env.npm_package_version)
  .option('--gclient_file <file>', 'gclient config file location')
  .option('--gclient_verbose', 'verbose output for gclient')
  .option('--run_hooks', 'run gclient hooks')
  .option('--run_sync', 'run gclient sync')
  .option('--submodule_sync', 'run submodule sync')
  .option('--init', 'initialize all dependencies')
  .option('--all', 'update all projects')
  .option('--android', 'initialize/update android browser')
  .option('--break_repo_locks', 'gclient break repo locks')

program.parse(process.argv)
config.update(program)

if (program.init || program.submodule_sync) {
  util.submoduleSync()
}

if (program.init) {
  util.buildGClientConfig()
}

let projectRefs = []
if (program.init || program.all) {
  config.projectNames.forEach((name) => {
    const project = config.projects[name]
    projectRefs =projectRefs.concat(['-r', project.gclientName + '@' + project.ref])
  })

  let args = projectRefs
  if (program.break_repo_locks)
    args.push('--break_repo_locks')

  util.gclientSync(true, args)
}

if (program.run_hooks) {
  util.gclientRunhooks()
}
