const gulp = require('gulp');
const typescript = require('gulp-typescript');
const mocha = require('gulp-mocha');
const gulpTslint = require('gulp-tslint');
const tslint = require('tslint');

gulp.task('compile', () => {
  const tsProject = typescript.createProject('tsconfig.json');
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

  return gulp.src('src/**/*.ts', { base: '.' })
    .pipe(gulpTslint({program}));
});

gulp.task('default', ['compile', 'test', 'lint']);
