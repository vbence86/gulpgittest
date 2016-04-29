'use strict';

const gulp = require('gulp');
const gutil = require('gutil');
const git = require('gulp-git');
const bump = require('gulp-bump');
const tag_version = require('gulp-tag-version');
const exec = require('child_process').exec;

let taggingMessage = 'Default tagging message';

// Define the key for versioning off 
gulp.task('bump', () => {
  gulp.src('./package.json')
  .pipe(bump({type: "major"}))
  .pipe(gulp.dest('./'));
});
 
// Run git push 
// remote is the remote repo 
// branch is the remote branch to push to 
gulp.task('pushtags', () => {
  git.push('origin', '', {args: '--tags'}, function (err) {
    if (err) throw err;
  });
});
 
// Run git push with options 
// branch is the remote branch to push to 
gulp.task('push', () => {
  git.push('origin', 'master', {args: " -f"}, function (err) {
    if (err) throw err;
  });
});
 
// Run git pull 
// remote is the remote repo 
// branch is the remote branch to pull from 
gulp.task('pull', () => {
  git.pull('origin', '', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});

// Tag the repo with a version 
gulp.task('tag', () => {
    gitpull().then(() => {
        
    });
});
const gitpull = () => {
    return new Promise(resolve, reject) => {
        git.pull('origin', '', err => {
            if (err) { 
                reject(err);
                return;
            }
            resolve();
        };
    };
};
const gitpushtags = () => {
    return new Promise(resolve, reject) => {
        git.push('origin', '', {args: '--tags'}, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    };
};
const gittaglist = (() => {

    let promise;   
    const isInt = val => { return !isNaN(val) && (x => (x | 0) === x)(parseFloat(val)); };
    const fetchTags = () => {
        if (!promise){
            promise = new Promise((resolve, reject) => {
                exec('git tag -l', (err, stdout) => {
                    if (err){
                        reject(err);
                        return;
                    }
                    if (!stdout || !stdout.length){
                        reject('Tag list cannot be fetched!');
                    }
                    let tags = stdout.split('\n').filter(tag => tag.length && isInt(tag));
                    if (!tags.length){
                        reject('Tag list is invalid!');
                    } else {
                        resolve(tags);
                    }
                });
            });
        }
        return promise;
    };

    return {
        each(callback){
            if (typeof callback !== 'function'){
                return;
            }
            fetchTags().then( tags => {
                tags.forEach(callback);
            }).catch( err => {
                throw err;
            });
        },
        latest(callback){
            if (typeof callback !== 'function'){
                return;
            }
            fetchTags().then( tags => {
                let tmp = tags.map(val => parseInt(val));
                const latest = tmp.sort((a, b) => a - b).pop();
                callback( latest );
            }).catch( err => {
                throw err;
            });
        },
        next(callback){
            if (typeof callback !== 'function'){
                return;
            }
            this.latest( (latest) => {
                latest = parseInt(latest) + 1;
                callback(latest);
            });
        }
    };
})();

gulp.task('taglist', () => {
    taglist.each( (tag) => {
        console.log(tag);
    });
});

gulp.task('nextversion', () => {
    taglist.next( (tag) => {
        console.log(tag);
    });
});


gulp.task('default', ['tag']);
 