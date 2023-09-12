module.exports = function (){
    var cache = {}
    return {
        get: (collection,key) => cache[collection+"_"+key],
        set: (collection,key,value) => cache[collection+"_"+key] = value,
    }
}