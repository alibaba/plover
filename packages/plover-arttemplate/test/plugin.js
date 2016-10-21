'use strict';


const pathUtil = require('path');
const plover = require('plover');
const request = require('supertest');

const plugin = require('../lib/plugin');


describe('plover-arttemplate/lib/plugin', function() {
  it('test', function() {
    const app = plover({
      applicationRoot: pathUtil.join(__dirname, 'fixtures/app'),
      arttemplate: {
        compress: true,
        async: false
      }
    });

    plugin(app);

    const expect =
`<div>
Hello
<ul>
<li>item</li>
</ul>
</div>
`;

    return request(app.callback())
      .get('/').expect(expect);
  });
});
