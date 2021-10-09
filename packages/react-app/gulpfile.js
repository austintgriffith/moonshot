const gulp = require('gulp')
const gulpless = require('gulp-less')
const postcss = require('gulp-postcss')
const debug = require('gulp-debug')
var csso = require('gulp-csso')
const autoprefixer = require('autoprefixer')
const NpmImportPlugin = require('less-plugin-npm-import')
const { getNotionDatabase, getPageProperty } = require('./scripts/notion')
const fs = require('fs')

gulp.task('less', function () {
  const plugins = [autoprefixer()]

  return gulp
    .src('src/themes/*-theme.less')
    .pipe(debug({title: 'Less files:'}))
    .pipe(
      gulpless({
        javascriptEnabled: true,
        plugins: [new NpmImportPlugin({prefix: '~'})],
      }),
    )
    .pipe(postcss(plugins))
    .pipe(
      csso({
        debug: true,
      }),
    )
    .pipe(gulp.dest('./public'))
})

gulp.task('notion-sync', async () => {
  const projectsDB = await getNotionDatabase('3ff32b7b50774a81975d34b100f7015f')
  const membersDB = await getNotionDatabase('206a62fe468940138b8940c88bac31bf')
  
  const members = membersDB.map(page => ({ name: getPageProperty(page, 'Name') }))
  const projects = projectsDB.map(page => {
    return { name: getPageProperty(page, 'Name'), link: getPageProperty(page, 'Github') }
  })

  
  const notionDB = {
    members: members.filter(member => Boolean(member.name)),
    projects: projects.filter(project => Boolean(project.name)),
  }
  
  console.log(notionDB)

  fs.writeFileSync('./public/static-info.json', JSON.stringify(notionDB))
})
