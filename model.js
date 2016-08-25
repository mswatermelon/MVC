var Model = {
    login: function(appId, perms) {
        return new Promise(function(resolve, reject) {
            VK.init({
                apiId: appId
            });

            VK.Auth.login(function(response) {
                if (response.session) {
                    resolve(response);
                } else {
                    reject(new Error('Не удалось авторизоваться'));
                }
            }, perms);
        });
    },
    callApi: function(method, params) {
        return new Promise(function(resolve, reject) {
            VK.api(method, params, function(response) {
                if (response.error) {
                    reject(new Error(response.error.error_msg));
                } else {
                    resolve(response.response);
                }
            });
        });
    },
    getUser: function() {
        return this.callApi('users.get', {});
    },
    getMusic: function() {
        return this.callApi('audio.get', {});
    },
    getFriends: function() {
        return this.callApi('friends.get', {fields: 'photo_100'});
    },
    getNews: function() {
        return this.callApi('newsfeed.get', {filters: 'post', count: 20});
    },
    getGroups: function() {
        return this.callApi('groups.get', {v: '5.53', extended: 1});
    },
    getPhoto: function() {
        let that = this;

        return this.callApi('photos.getAll', {v: '5.53', extended: 1, count:200})
            .then(function(photoItems) {
                return that.callApi('photos.getAllComments', {
                    v: '5.53',
                    extended: 1,
                    count: 100
                }).then(function (comments) {
                    for (let photo of photoItems.items) {
                        photo.comments = [];
                    }
                    for (let comment of comments.items) {
                        for (let photo of photoItems.items) {
                            if (comment.pid == photo.id) {
                                photo.comments.push(comment);
                                console.log(photo.comments);
                            }
                        }
                    }
                    return photoItems
                });
            });
    }
};
