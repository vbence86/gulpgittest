'use strict';

const gulp = require('gulp');
const gutil = require('gutil');
const bump = require('gulp-bump');
const tag_version = require('gulp-tag-version');
const git = require('gulp-git');
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
    gitcurrentbranch().then(branch => {
        return gitpull(branch);
    }).then(() => {
        return gitTagManager.increaseVersion();
    }).then( version => {
        return gittag(version, taggingMessage);
    }).then( () => {
        return gitpushtags();
    }).catch(err => {
        console.log(err);
        throw err;
    });
});
const gitcurrentbranch = () => {
    return new Promise((resolve, reject) => {
        exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
            let branch;
            if (err){
                reject(err);
                return;
            }
            branch = stdout.replace(/\s+/g, '');
            resolve(branch);
        });
    });
};
const gitpull = () => {
    return new Promise((resolve, reject) => {
        git.pull('origin', '', err => {
            if (err) { 
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const gittag = (tag, msg) => {
    return new Promise((resolve, reject) => {
        git.tag(tag, msg, err => {
            if (err){
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const gitpushtags = () => {
    return new Promise((resolve, reject) => {
        git.push('origin', '', {args: '--tags'}, err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};
const gitTagManager = (() => {

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
        latest(){
            return fetchTags().then( tags => {
                let tmp = tags.map(val => parseInt(val));
                const latest = tmp.sort((a, b) => a - b).pop();
                return latest;
            });
        },
        increaseVersion(){
            return this.latest().then( latest => {
                latest = parseInt(latest) + 1;
                return latest;
            });
        }
    };
})();

gulp.task('taglist', () => {
    gittaglist.each( (tag) => {
        console.log(tag);
    });
});

gulp.task('nextversion', () => {
    gittaglist.increaseVersion().then( next => {
        console.log(next); 
    } );
});


gulp.task('default', ['tag']);
 