const gulp = require("gulp");
const gulpless = require("gulp-less");
const postcss = require("gulp-postcss");
const debug = require("gulp-debug");
const csso = require("gulp-csso");
const compareAsc = require("date-fns/compareAsc");
const autoprefixer = require("autoprefixer");
const NpmImportPlugin = require("less-plugin-npm-import");
const fs = require("fs");
const { getNotionDatabase, getPageProperty } = require("./scripts/notion");

gulp.task("less", function () {
  const plugins = [autoprefixer()];

  return gulp
    .src("src/themes/*-theme.less")
    .pipe(debug({ title: "Less files:" }))
    .pipe(
      gulpless({
        javascriptEnabled: true,
        plugins: [new NpmImportPlugin({ prefix: "~" })],
      }),
    )
    .pipe(postcss(plugins))
    .pipe(
      csso({
        debug: true,
      }),
    )
    .pipe(gulp.dest("./public"));
});

gulp.task("notion-sync", async () => {
  const projectsDB = await getNotionDatabase("70c8e70f88084a248015d2313f755519");
  const membersDB = await getNotionDatabase("0608cdb5cede4517937e546c8e5e2713", {
    property: "Workstreams",
    multi_select: {
      contains: "Moonshot Collective",
    },
  });

  const members = membersDB
    .sort((a, b) => {
      const dateA = getPageProperty(a, "Contributor Start Date", "date");
      const dateB = getPageProperty(b, "Contributor Start Date", "date");
      const startA = new Date(dateA ? dateA.start : "");
      const startB = new Date(dateB ? dateB.start : "");
      return compareAsc(startA, startB);
    })
    .map(page => ({ name: getPageProperty(page, "Name") }));
  const projects = projectsDB.map(page => ({
    name: getPageProperty(page, "Name"),
    link: getPageProperty(page, "Github", "url"),
  }));

  const notionDB = {
    members: members.filter(member => Boolean(member.name)),
    projects: projects.filter(project => Boolean(project.name)),
  };

  console.log(notionDB);

  fs.writeFileSync("./public/static-info.json", JSON.stringify(notionDB));
});
