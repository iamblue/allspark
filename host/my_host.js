#!/usr/local/bin/node

// Might be good to use an explicit path to node on the shebang line in case
// it isn't in PATH when launched by Chrome.

var fs = require('fs');
var path = require('path');
var child = require('child_process');

var nativeMessage = require('../lib/index');

var input = new nativeMessage.Input();
var transform = new nativeMessage.Transform(messageHandler);
var output = new nativeMessage.Output();

process.stdin
    .pipe(input)
    .pipe(transform)
    .pipe(output)
    .pipe(process.stdout)
;

var subscriptions = {};

var timer = setInterval(function() {
    if (subscriptions.time) {
        output.write({ time: new Date().toISOString() });
    }
}, 1000);

input.on('end', function() {
    clearInterval(timer);
});

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

function messageHandler(msg, push, done) {
    // console.log(msg.filePath);
    switch (msg.type) {
        case 'download':
            //var filePath = 'C:\\msys64\\home\\allspark\\host\\new_uploader\\sample.bin';
            var filePath = msg.file;
            if (fs.existsSync(filePath)) {
                var bootLoaderPath;

                if (process.platform === 'win32') {
                    bootLoaderPath = __dirname + '\\new_uploader\\da.bin';
                    build = child.exec('upload.exe -c ' + msg.serial + ' -f ' + filePath + ' -t cm4', { cwd: __dirname + '\\new_uploader' });
                } else {
                    bootLoaderPath = './new_uploader/da.bin';
                    build = child.exec('python ./new_uploader/upload.py -c ' + msg.serial + ' -f ' + filePath + ' -t cm4');
                }

                var binFileSize = getFilesizeInBytes(filePath);
                var bootLoaderFileSize = getFilesizeInBytes(bootLoaderPath);
                var fileSize;

                build.stdout.on('data', function(data) {
                    push({ log: data });
                });

                build.stderr.on('data', function(data) {
                    if (/^progess/.test(data)) {
                        var value = Number(data.replace(/[^0-9]/g, ''));
                        var total = fileSize / 128;
                        push({ progress: (value / total) * 100 });
                    } else {
                        if (/^Start uploading the download agent/.test(data)) {
                            fileSize = bootLoaderFileSize;
                        } else if (/^DA uploaded, start uploading the user bin/.test(data)) {
                            fileSize = binFileSize;
                        }
                        push({ log: data });
                    }
                });

                build.on('exit', function() {
                    push({ log: 'exit' });
                    done();
                });
            } else {
                push({log: 'File is not exists!'});
                done();
            }
            break;
        default:
            break;
    }
}
