var Router = {
    handle: function(route) {
        var routeName = route + 'Route';


        /*if (!Controller.hasOwnProperty(routeName)) {
            throw new Error('Маршрут не найден!');
        }*/

        if (routeName == "photoRoute") {
            forSort.style.display = "block";
        }
        else forSort.style.display = "none";

        Controller[routeName]();
    }
};

