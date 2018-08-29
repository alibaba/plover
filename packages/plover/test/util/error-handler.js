const co = require('co');
const Koa = require('koa');
const request = require('supertest');
const sinon = require('sinon');
const Logger = require('plover-logger');

const errorHandler = require('../../lib/util/error-handler');


describe('util/error-handler', () => {
  beforeEach(() => {
    sinon.stub(Logger.prototype, 'error');
  });


  afterEach(() => {
    Logger.prototype.error.restore();
  });


  it('内层中间件出错时，开发环境会在页面打印异常', () => {
    const app = new Koa();
    const err = new Error('发生了错误怎么办');
    app.use(errorHandler({ env: 'development' }));
    app.use(ctx => {
      if (ctx.query.error === 'string') {
        throw err.message;
      }
      throw err;
    });
    return co(function* () {
      const agent = request.agent(app.callback());
      yield agent.get('/')
        .expect(500)
        .expect(/发生了错误怎么办?/);

      Logger.prototype.error.calledWith(err).should.be.true();
      Logger.prototype.error.reset();

      yield agent.get('/?error=string')
        .expect(500);

      Logger.prototype.error.calledWith(err.message).should.be.true();
    });
  });


  it('不处理500以下的错误', () => {
    const app = new Koa();
    app.use(errorHandler());
    app.use(ctx => {
      ctx.throw(400, '不允许进入');
    });

    return request(app.callback())
      .get('/')
      .expect(400);
  });


  it('非开发环境不会打印具体错误', async() => {
    const app = new Koa();
    app.use(errorHandler());
    app.use(() => {
      throw new Error('出现了一个粗心大意的错误');
    });

    const agent = request(app.callback());

    await agent.get('/')
      .expect(500)
      .expect('Internel Server Error');

    const res = { success: false, message: 'Internel Server Error' };

    await agent.get('/')
      .set('accept', 'application/json')
      .expect(res);

    await agent.post('/')
      .set('content-type', 'application/json')
      .expect(res);
  });
});
