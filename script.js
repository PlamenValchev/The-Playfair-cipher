jQuery.cipher = {
    key: "", 
    alpha: "", 
    allowed: "ABCDEFGHIKLMNOPQRSTUVWXYZ", 
    maxRow: 5, 
    maxCol: 5, 
    nullCh: 'X', 
    randomTable: false, 
    subCh: {
        sub: 'J', 
        rpl: 'I' 
    }
};


function shuffleStr(str) {
    var array = str.split("");
    var m = array.length,
        t, i;

    
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array.join("");
}


function printKey() {
    var tableHtml = "<table>";
    for (var i = 0; i < 25; i = i + 5) {
        tableHtml += "<tr>";
        var row = $.cipher.key.substring(i, i + 5);
        var chars = row.split("");
        for (var x = 0; x < 5; x++) {
            tableHtml += "<td>" + chars[x] + "</td>";
        }
        tableHtml += "</tr>";
    }
    tableHtml += "</table>";
    $("#keyTable").html(tableHtml);
}


function getCharPosition(c) {
    var index = $.cipher.key.indexOf(c);
    var row = Math.floor(index / 5);
    var col = index % 5;
    return {
        row: row,
        col: col
    };
}


function getCharFromPosition(pos) {
    var index = pos.row * 5;
    index = index + pos.col;
    return $.cipher.key.charAt(index);
}


function encipherPair(str) {
    if (str.length != 2) return false;
    var pos1 = getCharPosition(str.charAt(0));
    var pos2 = getCharPosition(str.charAt(1));
    var char1 = "";

    
    if (pos1.col == pos2.col) {
        pos1.row++;
        pos2.row++;
        if (pos1.row > $.cipher.maxRow - 1) pos1.row = 0;
        if (pos2.row > $.cipher.maxRow - 1) pos2.row = 0;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    } else if (pos1.row == pos2.row) { 
        pos1.col++;
        pos2.col++;
        if (pos1.col > $.cipher.maxCol - 1) pos1.col = 0;
        if (pos2.col > $.cipher.maxCol - 1) pos2.col = 0;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    } else { 
        var col1 = pos1.col;
        var col2 = pos2.col;
        pos1.col = col2;
        pos2.col = col1;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    }
    return char1;
}


function encipher(digraph) {
    if (!digraph) return false;
    var cipher = [];
    for (var i = 0; i < digraph.length; i++) {
        cipher.push(encipherPair(digraph[i]));
    }
    return cipher;
}


function decipherPair(str) {
    if (str.length != 2) return false;
    var pos1 = getCharPosition(str.charAt(0));
    var pos2 = getCharPosition(str.charAt(1));
    var char1 = "";

   
    if (pos1.col == pos2.col) {
        pos1.row--;
        pos2.row--;
        if (pos1.row < 0) pos1.row = $.cipher.maxRow - 1;
        if (pos2.row < 0) pos2.row = $.cipher.maxRow - 1;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    } else if (pos1.row == pos2.row) { // Same row - Decrement 1 column, wrap around to right
        pos1.col--;
        pos2.col--;
        if (pos1.col < 0) pos1.col = $.cipher.maxCol - 1;
        if (pos2.col < 0) pos2.col = $.cipher.maxCol - 1;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    } else { // Box rules, use opposing corners (same as forward)
        var col1 = pos1.col;
        var col2 = pos2.col;
        pos1.col = col2;
        pos2.col = col1;
        char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
    }
    return char1;
}


function decipher(digraph) {
    if (!digraph) return false;
    var plaintext = [];
    for (var i = 0; i < digraph.length; i++) {
        plaintext.push(decipherPair(digraph[i]));
    }
    return plaintext;
}


function makeDigraph(str) {
    if (!str) return false;
    var digraph = [];
    str = str.toUpperCase();
    str = str.replace(/\W+/g, "");
    str = str.replace($.cipher.subCh.sub, $.cipher.subCh.rpl);
    var strArr = str.split("");

    for (var i = 0; i < str.length; i++) {
        if ($.cipher.allowed.indexOf(strArr[i]) == -1) continue;
        if (i + 1 >= str.length) digraph.push(strArr[i] + $.cipher.nullCh);
        else if (strArr[i] == strArr[i + 1]) digraph.push(strArr[i] + $.cipher.nullCh);
        else digraph.push(strArr[i] + strArr[++i]);
    }
    return digraph;
}


function generateKeyTable(keystring) {
    if (!keystring) keystring = "PLAYFAIRCIPHER";

    
    keystring = keystring.toUpperCase();
    keystring = keystring.replace(/\W+/g, "");
    keystring = keystring.replace($.cipher.subCh.sub, $.cipher.subCh.rpl);

    
    $.cipher.key = "";
    $.cipher.alpha = $.cipher.allowed;

    
    var keyArr = keystring.split("");
    $.each(keyArr, function (x, c) {
        if ($.cipher.alpha.indexOf(c) > -1 && $.cipher.key.indexOf(c) == -1) {
            $.cipher.key += c;
            $.cipher.alpha = $.cipher.alpha.replace(c, "");
        }
    });

    
    if ($.cipher.randomTable) $.cipher.key += shuffleStr($.cipher.alpha);
    else $.cipher.key += $.cipher.alpha;
}


$("#generateKeytable").click(function () {
    $(this).hide();
    $("#regenerateKeytable").show();
    generateKeyTable($("#keyword").val());
    $("#key").text($.cipher.key);
    printKey();
    $("#AfterGen").slideDown();
});


$("#regenerateKeytable").click(function () {
    $("#AfterGen").hide();
    generateKeyTable($("#keyword").val());
    $("#key").text($.cipher.key);
    printKey();
    $("#AfterGen").slideDown();
});


$("#encipher").click(function () {
    var digraph = makeDigraph($("#en").val());
    if (!digraph) alert("Bad entry");
    $("#en").val(digraph.join(" "));
    var cipher = encipher(digraph);
    $("#de").val(cipher.join(" "));
});


