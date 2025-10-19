import { init } from "./Dom.js";
import Auth from "./Auth.js";
import { EditMode } from "./Dom.js";

init();
if (Auth.isLogged()) {
  EditMode.enable();
}
