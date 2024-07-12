const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("can create issue with all fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "nuevo issue",
        issue_text: "este es un nuevo issue de valen",
        created_by: "valen",
        assigned_to: "vale",
        status_text: "opened",
      })
      .end(function (err, res) {
        assert.equal(res.body.issue_title, "nuevo issue");
        assert.equal(res.body.issue_text, "este es un nuevo issue de valen");
        assert.equal(res.body.created_by, "valen");
        assert.equal(res.body.assigned_to, "vale");
        assert.equal(res.body.status_text, "opened");
        done();
      });
  });

  test("can create issue with only required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "another issue but in english",
        issue_text: "this works",
        created_by: "valen",
      })
      .end(function (err, res) {
        assert.equal(res.body.issue_title, "another issue but in english");
        assert.equal(res.body.issue_text, "this works");
        assert.equal(res.body.created_by, "valen");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        done();
      });
  });

  test("does not allow create issue without required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({})
      .end(function (err, res) {
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("can show issues of a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .end(function (err, res) {
        assert.isArray(res.body);
        done();
      });
  });

  test("can filter issues of a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest?open=true")
      .end(function (err, res) {
        assert.isArray(res.body);
        if (res.body.length > 0) {
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].open, true);
          }
        }
        done();
      });
  });

  test("can filter by multiple fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest?open=false&issue_title=wrqewr")
      .end(function (err, res) {
        assert.isArray(res.body);
        if (res.body.length > 0) {
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].open, true);
            assert.equal(res.body[i].issue_title, "wrqewr");
          }
        }
        done();
      });
  });

  test("can update one field on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "669168d9eb73ee40eaea339c", issue_title: "updatedissue" })
      .end(function (err, res) {
        console.log(res.body);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "669168d9eb73ee40eaea339c");
        done();
      });
  });

  test("can update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        _id: "669168d9eb73ee40eaea339c",
        issue_title: "updated issue",
        issue_text: "updated text",
      })
      .end(function (err, res) {
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "669168d9eb73ee40eaea339c");
        done();
      });
  });

  test("can not update and issue if an _id is not provided", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ issue_title: "updated issue", issue_text: "updated text" })
      .end(function (err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("executes and update without fields to update", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "669168d9eb73ee40eaea339c" })
      .end(function (err, res) {
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, "669168d9eb73ee40eaea339c");
        done();
      });
  });

  test("does not update if a invalid _id is provided", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        _id: "invalidid",
        issue_title: "updated issue",
        issue_text: "updated text",
      })
      .end(function (err, res) {
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "invalidid");
        done();
      });
  });

  test("can delete an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id: "669168d9eb73ee40eaea339c" })
      .end(function (err, res) {
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, "669168d9eb73ee40eaea339c");
        done();
      });
  });

  test("can not delete if an invalid _id is provided", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id: "invalidid" })
      .end(function (err, res) {
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "invalidid");
        done();
      });
  });

  test("can not delete if an _id is not provided", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .end(function (err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
