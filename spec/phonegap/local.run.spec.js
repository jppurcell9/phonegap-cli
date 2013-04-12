/*
 * Module dependencies.
 */

var PhoneGap = require('../../lib/phonegap'),
    cordova = require('cordova'),
    phonegap,
    options;

/*
 * Specification: phonegap.local.run(options, [callback])
 */

describe('phonegap.local.run(options, [callback])', function() {
    beforeEach(function() {
        phonegap = new PhoneGap();
        options = {
            platforms: ['android']
        };
        spyOn(process.stdout, 'write');
        spyOn(phonegap.local, 'build');
        spyOn(cordova, 'emulate');
    });

    it('should require options', function() {
        expect(function() {
            options = undefined;
            phonegap.local.run(options, function(e) {});
        }).toThrow();
    });

    it('should require options.platforms', function() {
        expect(function() {
            options.platforms = undefined;
            phonegap.local.run(options, function(e) {});
        }).toThrow();
    });

    it('should not require callback', function() {
        expect(function() {
            phonegap.local.run(options);
        }).not.toThrow();
    });

    it('should return itself', function() {
        expect(phonegap.local.run(options)).toEqual(phonegap);
    });

    it('should try to build', function() {
        phonegap.local.run(options);
        expect(phonegap.local.build).toHaveBeenCalled();
    });

    describe('successful build', function() {
        beforeEach(function() {
            phonegap.local.build.andCallFake(function(options, callback) {
                callback(null);
            });
        });

        it('should run the app', function() {
            phonegap.local.run(options);
            expect(cordova.emulate).toHaveBeenCalledWith(
                options.platforms,
                jasmine.any(Function)
            );
        });

        describe('successful run', function() {
            beforeEach(function() {
                cordova.emulate.andCallFake(function(platforms, callback) {
                    callback();
                });
            });

            it('should call callback without an error', function(done) {
                phonegap.local.run(options, function(e) {
                    expect(e).toBeNull();
                    done();
                });
            });
        });

        describe('failed run', function() {
            beforeEach(function() {
                cordova.emulate.andCallFake(function(platforms, callback) {
                    throw new Error('Ganon stole the binaries');
                });
            });

            it('should call callback with an error', function(done) {
                phonegap.local.run(options, function(e) {
                    expect(e).toEqual(jasmine.any(Error));
                    done();
                });
            });

            it('should fire "error" event', function(done) {
                phonegap.on('error', function(e) {
                    expect(e).toEqual(jasmine.any(Error));
                    done();
                });
                phonegap.local.run(options);
            });
        });
    });

    describe('failed build', function() {
        beforeEach(function() {
            phonegap.local.build.andCallFake(function(opts, callback) {
                callback(new Error('file I/O error'));
            });
        });

        it('should call callback with an error', function(done) {
            phonegap.local.run(options, function(e, data) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
        });

        it('should fire "error" event', function(done) {
            phonegap.on('error', function(e) {
                expect(e).toEqual(jasmine.any(Error));
                done();
            });
            phonegap.local.run(options);
        });
    });
});