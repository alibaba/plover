

const RouteInfo = require('..').RouteInfo;


describe('plover-util/lib/route-info', function() {
  it('#parse', function() {
    const parent = { module: 'index' };

    let route = RouteInfo.parse(parent, 'view');
    route.module.should.equal('index');
    route.action.should.equal('view');

    route = RouteInfo.parse(parent, 'offer:item');
    route.module.should.equal('offer');
    route.action.should.equal('item');

    route = RouteInfo.parse(parent, 'tools/photos#show');
    route.module.should.equal('tools/photos');
    route.action.should.equal('show');

    route = RouteInfo.parse(parent);
    route.module.should.equal('index');
    route.action.should.equal('view');

    route = RouteInfo.parse(parent, 'lib:css/tabs.css');
    route.module.should.equal('lib');
    route.action.should.equal('css/tabs.css');
  });


  it('#regular', function() {
    let route = { module: 'index', action: 'item' };
    RouteInfo.regular(route);
    route.url.should.equal('index:item');

    route = { module: 'offer' };
    RouteInfo.regular(route);
    route.url.should.equal('offer:view');
  });
});
