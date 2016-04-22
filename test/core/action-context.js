'use strict';


const sinon = require('sinon');
const ActionContext = require('../../lib/core/action-context');


describe('core/action-context', function() {
  const navigator = {};

  it('可以使用koa相关属性', function() {
    const ctx = {
      request: {},
      response: {},
      session: {},
      cookies: {}
    };

    const rd = {
      ctx: ctx
    };

    const ac = new ActionContext(navigator, rd);

    ac.ctx.should.equal(ctx);
    ac.request.should.equal(ctx.request);
    ac.response.should.equal(ctx.response);
    ac.session.should.equal(ctx.session);
    ac.cookies.should.equal(ctx.cookies);
  });


  it('请求参数的获取', function() {
    const ctx = {
      request: {
        body: {
          name: 'test2',
          content: 'content'
        }
      }
    };
    const route = {
      query: {
        name: 'test',
        desc: 'hello test'
      }
    };
    const rd = {
      ctx: ctx,
      route: route
    };

    const ac = new ActionContext(navigator, rd);
    ac.query.should.equal(route.query);

    const params = ac.params;
    params.should.eql({
      name: 'test2',
      desc: 'hello test',
      content: 'content'
    });

    // 多次获取这个属性会cache
    ac.params.should.equal(params);
  });


  it('中间件中的state和data会合并到控制器上下文和模板上下文', function() {
    const ctx = {
      state: {
        member: {}
      },
      data: {
        urls: {}
      }
    };

    const rd = {
      info: {},
      route: {},
      data: {},
      ctx: ctx
    };

    const ac = new ActionContext(navigator, rd);
    ac.minfo.should.equal(rd.info);
    ac.route.should.equal(rd.route);

    ac.state.should.equal(ctx.state);
    ac.member.should.equal(ctx.state.member);

    rd.data.urls.should.equal(ctx.data.urls);
  });


  it('使用type, view和layout', function() {
    const rd = {
      ctx: {},
      route: {},

      type: 'view',
      view: 'view',
      layout: {
        enable: true,
        name: 'layouts:view',
        data: {
          title: 'page title',
          desc: 'page desc'
        }
      }
    };

    const ac = new ActionContext(navigator, rd);

    // type
    ac.type.should.equal('view');

    ac.type = 'json';
    rd.type.should.equal('json');

    // view
    ac.view.should.equal('view');

    ac.view = 'other';
    rd.view.should.equal('other');

    // layout
    ac.layout.should.equal(rd.layout);
    ac.layout.should.eql({
      enable: true,
      name: 'layouts:view',
      data: {
        title: 'page title',
        desc: 'page desc'
      }
    });

    // 1 this.layout = false
    ac.layout = false;
    rd.layout.enable.should.be.false();

    // 2 this.layout = otherLayout
    ac.layout = 'layouts:mobile';
    ac.layout.name.should.equal('layouts:mobile');

    // 3. this.layout = { name: ..., data: ... }
    ac.layout = {
      name: 'layouts:simple',
      data: {
        title: 'page title update',
        body: 'page body'
      }
    };

    ac.layout.name.should.equal('layouts:simple');
    ac.layout.data.should.eql({
      title: 'page title update',
      desc: 'page desc',
      body: 'page body'
    });
  });
  //~


  it('忽略非顶层模块的layout设置', function() {
    const rd = {
      ctx: {},
      route: { parent: {} },    // 非顶级模块

      layout: {
        enable: true
      }
    };

    const ac = new ActionContext(navigator, rd);
    ac.layout.enable.should.be.true();

    ac.layout = false;
    ac.layout.enable.should.be.true();
  });


  describe('this.render([data], [options])', function() {
    it('使用this.render()渲染模块', function() {
      const rd = {
        ctx: {},
        data: {}
      };

      const ac = new ActionContext(navigator, rd);
      ac.render({
        title: 'hello'
      });

      ac.shouldRender.should.be.true();
      rd.data.title.should.equal('hello');

      (() => {
        ac.render();
      }).should.throw('this.render() already called.');
    });


    it('可以传递额外的参数', function() {
      const rd = {
        ctx: {},
        data: {},
        route: {},

        type: 'view',
        view: 'view',
        layout: {
          enable: true,
          name: 'layouts:view',
          data: {}
        }
      };

      const ac = new ActionContext(navigator, rd);
      const data = { info: {} };
      ac.render(data, {
        type: 'xml',
        view: 'other',
        layout: {
          name: 'layouts:xml',
          data: {
            title: 'my title'
          }
        }
      });

      rd.type.should.equal('xml');
      rd.view.should.equal('other');
      rd.layout.should.eql({
        enable: true,
        name: 'layouts:xml',
        data: {
          title: 'my title'
        }
      });
    });
  });


  describe('this.navigate(route, [options])使用this.navigate跳转到另一模块', function() {
    it('使用this.navigate()跳转到另一模块', function() {
      const ret = {};
      const nav = {
        navigate: sinon.stub().returns(ret)
      };
      const rd = {
        ctx: {},

        route: {
          module: 'offer',
          action: 'list',
          query: {}
        }
      };
      const ac = new ActionContext(nav, rd);
      const o = ac.navigate('offer:item');

      const nroute = nav.navigate.args[0][0];

      nroute.root.should.equal(nroute);

      nroute.module.should.equal('offer');
      nroute.action.should.equal('item');
      nroute.query.should.equal(rd.route.query);
      (nroute.parent === null).should.be.true();
      nroute.type.should.equal('view');
      nroute.navigate.should.be.true();

      o.should.equal(ret);
    });
  });

  it('this.navigate(route, options) - 传递额外的route参数', function() {
    const nav = {
      navigate: sinon.spy()
    };

    const rd = {
      ctx: {},

      route: {
        module: 'offer',
        action: 'view',
        query: {}
      }
    };

    const ac = new ActionContext(nav, rd);
    const query = { id: 123 };
    ac.navigate('item', {
      type: 'json',
      query: query
    });

    const nroute = nav.navigate.args[0][0];
    nroute.type.should.equal('json');
    nroute.query.should.equal(query);
  });
});

