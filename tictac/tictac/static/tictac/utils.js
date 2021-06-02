//Using this to make scores display friendly
function abbrNum(num, decimal) {
    decimal = Math.pow(10, decimal);
    var abrv = ["k", "m", "b", "t"];
    for (var i = abrv.length - 1; i >= 0; i--) {
        var size = Math.pow(10, (i + 1) * 3);
        if (size <= num) {
            num = Math.round(num * decimal / size) / decimal;
            if ((num == 1000) && (i < abrv.length - 1)) {
                num = 1;
                i++;
            }
            num += abrv[i];
            break;
        }
    }
    return num;
}

// Using this to format timestamps to a readable format
function transformDate(timestamp) {
    let datetime = new Date(timestamp)
    return datetime.toLocaleString();
}