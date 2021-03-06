var Controller = {
    musicRoute: function() {
        return Model.getMusic().then(function(music) {
            results.innerHTML = View.render('music', {list: music});
        });
    },
    friendsRoute: function() {
        return Model.getFriends().then(function(friends) {
            results.innerHTML = View.render('friends', {list: friends});
        });
    },
    newsRoute: function() {
        return Model.getNews().then(function(news) {
            results.innerHTML = View.render('news', {list: news.items});
        });
    },
    groupsRoute: function() {
        return Model.getGroups().then(function(groups) {
            results.innerHTML = View.render('groups', {list: groups.items});
        });
    },
    photoRoute: function() {
        return Model.getPhoto().then(function(photo) {
            results.innerHTML = View.render('photo', {list: photo.items});
        });
    },
    updateRoute: function(photo) {
        // Обновим отображение всех фото после сортировки
        results.innerHTML = View.render('photo', {list: photo.items});
    }
};
