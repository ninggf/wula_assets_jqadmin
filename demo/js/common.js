/**
 * 获取元素对象的属性值，并转换成对象
 * @param {元素对象} obj 
 * @param {元素对象属性} attr 
 * @param {jquery} $ 
 */
function getParams(obj, attr, $) {
    var params = $(obj).attr(attr);
    if (params) {
        if (typeof(params) == "string") {
            return new Function("return " + params)();
        }
    }
    return params;
}

function strRepeat(str, count) {
    var ret = "";
    for (var i = 0; i < count; i++) {
        ret += str;
    }
    return ret;
}