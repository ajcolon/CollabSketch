
require.config({
    paths: {
        libs: '../bower_components',
        jquery: '../bower_components/jquery/jquery'
    }
});

require(['bigdraw'],function(BigDraw){
	BigDraw.init();
});