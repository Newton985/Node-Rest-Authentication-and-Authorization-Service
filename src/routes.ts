import {UserController} from "./controller/UserController";

export const Routes = [{
    //--USER RELATED STUFF--//

    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
    access:"admin"
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
    access:"all"
    
}, {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "save",
    access:"all"
    
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
    access: "all"

},  //END USER

];