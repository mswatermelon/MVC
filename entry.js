Handlebars.registerHelper('formatTime', function(time) {
    var minutes = parseInt(time / 60),
        seconds = time - minutes * 60;

    minutes = minutes.toString().length === 1 ? '0' + minutes : minutes;
    seconds = seconds.toString().length === 1 ? '0' + seconds : seconds;

    return minutes + ':' + seconds;
});

Handlebars.registerHelper('formatDate', function(ts) {
    return new Date(ts * 1000).toLocaleString();
});

Handlebars.registerHelper('clear', function(val) {
    return val || 0;
});

Handlebars.registerHelper('reverse', function (arr) {
    arr.reverse();
});

Handlebars.registerHelper('reply', function(val) {
    let string = val,
        index;

    if (val.valueOf('[id') != -1) {
        index = val.indexOf('|');
        string = val.substr(index + 1, val.length).replace(']', '');
    }
    return string;
});

document.addEventListener('click', function (e) {
    if (e.target.getAttribute('id') == "update") {
        let params = [
            document.getElementById("sortType").value,
            document.getElementById("sortOrder").value
        ];

        Model.updatePhoto(params);
    }
});

new Promise(function(resolve) {
    window.onload = resolve;
}).then(function() {
    return Model.login(5583715, 2 | 4 | 8 | 8192);
}).then(function() {
    return Model.getUser().then(function(users) {
        header.innerHTML = View.render('header', users[0]);
    });
}).catch(function(e) {
    console.error(e);
    alert('Ошибка: ' + e.message);
});

