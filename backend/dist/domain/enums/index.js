"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaboratorRole = exports.RepositoryVisibility = exports.AuthProvider = exports.SubscriptionPlan = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "free";
    SubscriptionPlan["PRO"] = "pro";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "local";
    AuthProvider["GOOGLE"] = "google";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var RepositoryVisibility;
(function (RepositoryVisibility) {
    RepositoryVisibility["PUBLIC"] = "public";
    RepositoryVisibility["PRIVATE"] = "private";
})(RepositoryVisibility || (exports.RepositoryVisibility = RepositoryVisibility = {}));
var CollaboratorRole;
(function (CollaboratorRole) {
    CollaboratorRole["READ"] = "read";
    CollaboratorRole["WRITE"] = "write";
    CollaboratorRole["ADMIN"] = "admin";
})(CollaboratorRole || (exports.CollaboratorRole = CollaboratorRole = {}));
