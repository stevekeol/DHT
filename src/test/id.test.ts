import Id from '../id';

describe('Id', function() {
    it('.generate() should generate proper id', function (cb) {
        Id.generate(function (err, id) {
            if (err) cb(err);
            id.toString().length.should.equal(Id.SIZE * 2);
            cb();
        });
    });
}); 