#!/usr/local/bin/node

// Might be good to use an explicit path to node on the shebang line in case
// it isn't in PATH when launched by Chrome.

var fs = require('fs');
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
    switch (msg.type) {
        case 'download':
            var bootLoaderPath = './new_uploader/upload.py';
            if (process.platform === 'win32') {
                build = child.exec('./build.sh', {cwd: '/Users/blue-mtk/mtk/test_ml'});
            } else {
                build = child.exec('python ' + bootLoaderPath + ' -c ' + msg.serialPortsValue + ' -f ' + msg.filePath + ' -t cm4');
            }

            var binFileSize = getFilesizeInBytes(msg.filePath);
            var bootLoaderFileSize = getFilesizeInBytes(bootLoaderPath);
            var fileSize;
            build.stdout.on('data', function(data) {
                push({ log: data });
            });

            build.stderr.on('data', function(data) {
                if (/^progess/.test(data)) {
                    var value = Number(data.replace('progress:', ''));
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
            break;
        case 'screen':
            push({ log: 'screen -x ' + msg.serialPortsValue + ' 115200' });

            build = child.spawn('screen', [msg.serialPortsValue, '115200']);
            build.stdout.on('data', function(data) {
                push({ Bufferlog: data });
            });

            build.stderr.on('data', function(data) {
                push({ Bufferlog: data });
            });
            build.on('exit', function() {
                push({ log: 'exit' });
                done();
            });
            break;
        default:
            break;
    }
    // if (msg.readdir) {
    //     var build;
    //     if (process.platform === 'win32') {
    //         build = child.exec('./build.sh', {cwd: '/Users/blue-mtk/mtk/test_ml'});
    //     } else {
    //         build = child.exec('sh ./t.sh', {cwd: '/Users/blue-mtk/mtk/allspark/host'});
    //     }
    //     // child.unref();
    //     build.stdout.on('data', function(data) {
    //         push({ okfile: data });
    //     });

    //     build.stderr.on('data', function(data) {
    //         push({ errfile: data });
    //     });
    //     build.on('exit', function() {
    //         push({ file: 'exit' });
    //         done();
    //     });
    //     // fs.readdir(msg.readdir, function(err, files) {
    //     //     if (err) {
    //     //         push({ error: err.message || err });
    //     //     } else {
    //     //         files.forEach(function(file) {
    //     //             push({ file: file });
    //     //         });
    //     //     }
    //     // });
    // } else if (msg.subscribe) {
    //     subscriptions[msg.subscribe] = true;
    //     push({ subscribed: msg.subscribe });
    //     done();
    // } else if (msg.unsubscribe) {
    //     delete subscriptions[msg.unsubscribe];
    //     push({ unsubscribed: msg.unsubscribe });
    //     done();
    // } else {
    //     // Just echo the message:
    //     push(msg);
    //     done();
    // }
}
