const gulp = require('gulp');
const typescript = require('gulp-typescript');
const mocha = require('gulp-mocha');
const gulpTslint = require('gulp-tslint');
const tslint = require('tslint');

const tsProject = typescript.createProject('tsconfig.json');

gulp.task('compile', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());

  return tsResult.js.pipe(gulp.dest('build'));
});

gulp.task('test', ['compile'], () => {
  return gulp.src('build/**/*.spec.js')
    .pipe(mocha());
});

gulp.task('lint', () => {
  const program = tslint.Linter.createProgram('./tsconfig.json');

  return tsProject.src()
    .pipe(gulpTslint({program}))
    .pipe(gulpTslint.report());
});

gulp.task('watch', () => {
  return gulp.watch('src/**/*.ts', ['default']);
});

gulp.task('watch:test', () => {
  return gulp.watch('src/**/*.ts', ['test']);
});

gulp.task('default', ['compile', 'test', 'lint']);
