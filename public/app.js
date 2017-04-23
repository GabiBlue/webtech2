var app = angular.module("library", [ "ngRoute" ]);
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "home.html"
        })
        .when("/listBooks", {
            templateUrl: "listBooks.html",
            controller: "bookController"
        })
        .when("/userSettings", {
            templateUrl: "userSettings.html",
            controller: "userController"
        })
        .when("/addAuthor", {
            templateUrl: "addAuthor.html",
            controller: "authorController"
        })
        .when("/addBook", {
            templateUrl: "addBook.html",
            controller: "bookController"
        })
        .when("/addBookInstance", {
            templateUrl: "addBookInstance.html",
            controller: "bookController"
        })
        .when("/manageRentals", {
            templateUrl: "manageRentals.html",
            controller: "bookController"
        })
});
app.controller("mainController", function($scope, $rootScope, $http, $location) {
    $rootScope.loginUser = {};
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        $http.get("/user").then(function(response) {
            $rootScope.user = angular.copy(response.data);
            if ($rootScope.user === "") {
                $rootScope.user = undefined;
            }
        });
        if ($rootScope.user === undefined && next.originalPath !== "/" && next.originalPath !== "/login") {
            $location.path("/");
        }
    });
});
app.controller("userController", function($scope, $rootScope, $http, $location) {
    $scope.incorrect = false;
    $scope.login = function() {
        $http.post("/login", $rootScope.loginUser).then(
            function(response) {
                $scope.statusCode = response.status;
                if ($scope.statusCode === 200) {
                    $rootScope.user = angular.copy(response.data);
                    $scope.incorrect = false;
                    if ($rootScope.user === "") {
                        $rootScope.user = undefined;
                    }
                    $rootScope.loginUser = {};
                    $location.path("/");
                }
            },
            function(response) {
                $scope.statusCode = response.status;
                if ($scope.statusCode === 401) {
                    $scope.incorrect = true;
                }
            }
        );
    };
    $scope.logout = function() {
        $http.post("/logout").then(
            function(response) {
                $scope.statusCode = response.status;
                $location.path("/");
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
        $rootScope.user = undefined;
    };
    $scope.settings = function () {
        $http.post("/userSettings", $scope.modifiedUser).then(
            function(response) {
                $scope.statusCode = response.status;
                $http.get("/user").then(function(response) {
                    $rootScope.user = angular.copy(response.data);
                });
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };
});
app.controller("authorController", function($scope, $http) {
    $scope.addAuthor = function() {
        $http.post("/addAuthor", $scope.author).then(
            function(response) {
                $scope.statusCode = response.status;
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };
});
app.controller("bookController", function($scope, $http, $rootScope) {
    $http.get("/authors").then(function(response) {
        $scope.authors = response.data;
    });

    $http.get("/genres").then(function(response) {
        $scope.genres = response.data;
    });

    $http.get("/requests").then(function(response) {
        $scope.requests = response.data;
    });

    $scope.addBook = function() {
        $http.post("/addBook", $scope.book).then(
            function(response) {
                $scope.statusCode = response.status;
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };

    $http.get("/books").then(function(response) {
        $scope.books = response.data;
        $http.get("/requests").then(function(response) {
            $scope.requests = angular.copy(response.data);
        });
        console.log($scope.requests);
        var booksLength = $scope.books.length;
        var requestsLength = $scope.requests.length;
        for (var i = 0; i < booksLength; i++) {
            for (var j = 0; j < requestsLength; j++) {
                if ($scope.requests[j].author === $scope.books[i].author && $scope.requests[j].title === $scope.books[i].title
                    && $scope.requests[j].user === $rootScope.user.username) {
                    $scope.books[i].requested = "requested";
                }
            }
        }
    });

    $scope.addBookInstance = function (bookID, quantity) {
        $http.post("/addBookInstance/" + bookID + "/" + quantity).then(
            function(response) {
                $scope.statusCode = response.status;
                $http.get("/books").then(function(response) {
                    $scope.books = angular.copy(response.data);
                });
                console.log($scope.books);
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };

    $scope.orderBy = "+author";
    $scope.orderByAuthor = function() {
        if ($scope.orderBy === "+author") {
            $scope.orderBy = "-author";
        }
        else {
            $scope.orderBy = "+author";
        }
    };
    $scope.orderByTitle = function() {
        if ($scope.orderBy === "+title") {
            $scope.orderBy = "-title";
        }
        else {
            $scope.orderBy = "+title";
        }
    };
    $scope.orderByGenre = function() {
        if ($scope.orderBy === "+genre") {
            $scope.orderBy = "-genre";
        }
        else {
            $scope.orderBy = "+genre";
        }
    };

    $scope.reset = function () {
        $scope.author = undefined;
        $scope.genre = undefined;
        $scope.available = undefined;
    };

    $scope.availableFilter = function(prop, val){
        return function(item){
            if ($scope.available){
            return item[prop] > val;
            }
            else {
                return true;
            }
        }
    };

    $scope.requestBook = function (bookID) {
        $http.post("/requestBook/" + bookID).then(
            function(response) {
                $scope.statusCode = response.status;
                $http.get("/requests").then(function(response) {
                    $scope.requests = angular.copy(response.data);
                });
                $http.get("/books").then(function(response) {
                    $scope.books = angular.copy(response.data);
                    var booksLength = $scope.books.length;
                    var requestsLength = $scope.requests.length;
                    for (var i = 0; i < booksLength; i++) {
                        for (var j = 0; j < requestsLength; j++) {
                            if ($scope.requests[j].author === $scope.books[i].author && $scope.requests[j].title === $scope.books[i].title
                                && $scope.requests[j].user === $rootScope.user.username) {
                                $scope.books[i].requested = "requested";
                            }
                        }
                    }
                });
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };

    $scope.lendBook = function(request) {
        $scope.request = request;
        $http.post("/lendBook", $scope.request).then(
            function(response) {
                $scope.statusCode = response.status;
                $http.get("/requests").then(function(response) {
                    $scope.requests = response.data;
                });
            },
            function(response) {
                $scope.statusCode = response.status;
            }
        );
    };
});