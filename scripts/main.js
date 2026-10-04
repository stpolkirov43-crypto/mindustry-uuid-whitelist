// UUID whitelist for Mindustry v160.5
// F8 console commands:
//   uuidwl("help")
//   uuidwl("add", "UUID")
//   uuidwl("remove", "UUID")
//   uuidwl("players")       - connected players, click to copy UUID
//   uuidwl("connections")   - connection log, click to copy UUID
//   uuidwl("copy")          - copy last connected player's UUID
//   uuidwl("copy", "UUID") - copy a specific UUID
//   uuidwl("clear")

var KICK_REASON = "You are not on the UUID whitelist.";
var BUILD_ID = "1.5-mindustry-160.5-persistent";

function normalizeUUID(value){
    if(value == null) return "";
    return String(value).trim();
}

function getUUID(player){
    if(player == null) return "";
    try{
        return normalizeUUID(player.uuid());
    }catch(e){
        print("[UUID-WL] Failed to read player.uuid(): " + e);
        return "";
    }
}

// Build the global command/state in the exact Rhino scope used by F8.
var initScript =
    "var uuidwlStorageKey = 'uuid-whitelist.allowed-uuids.v1';\n" +
    "var uuidwlState = (typeof uuidwlState !== 'undefined' && uuidwlState) ? uuidwlState : {list: [], connections: [], lastUUID: ''};\n" +
    "if(!uuidwlState.list) uuidwlState.list = [];\n" +
    "if(!uuidwlState.connections) uuidwlState.connections = [];\n" +
    "if(typeof uuidwlState.lastUUID === 'undefined') uuidwlState.lastUUID = '';\n" +

    "var uuidwlSave = function(){\n" +
    "  try{\n" +
    "    var settings = Packages.arc.Core.settings;\n" +
    "    settings.put(uuidwlStorageKey, JSON.stringify(uuidwlState.list));\n" +
    "    settings.forceSave();\n" +
    "    return true;\n" +
    "  }catch(e){ print('[UUID-WL] Failed to save UUID whitelist: ' + e); return false; }\n" +
    "};\n" +

    "var uuidwlShowPlayers = function(){\n" +
    "  try{\n" +
    "    var BaseDialog = Packages.mindustry.ui.dialogs.BaseDialog;\n" +
    "    var Core = Packages.arc.Core;\n" +
    "    var Groups = Packages.mindustry.gen.Groups;\n" +
    "    var dialog = new BaseDialog('UUID Whitelist - Players');\n" +
    "    dialog.cont.pane(function(list){\n" +
    "      list.margin(10);\n" +
    "      list.add('Click a player to copy their UUID.').padBottom(10).row();\n" +
    "      list.top().left();\n" +
    "      var count = 0;\n" +
    "      Groups.player.each(function(player){\n" +
    "        if(player == null) return;\n" +
    "        var uuid = String(player.uuid());\n" +
    "        var name = player.name == null ? 'Unknown' : String(player.name);\n" +
    "        var rowText = name + '  |  ' + uuid;\n" +
    "        list.button(rowText, (function(u, n){ return function(){\n" +
    "          try{ Core.app.setClipboardText(u); print('[UUID-WL] Copied UUID of ' + n + ': ' + u); }\n" +
    "          catch(e){ print('[UUID-WL] Failed to copy UUID: ' + e); }\n" +
    "        }; })(uuid, name)).growX().height(55).padBottom(4).row();\n" +
    "        count++;\n" +
    "      });\n" +
    "      if(count === 0) list.add('No players connected.').pad(10);\n" +
    "    }).grow();\n" +
    "    dialog.addCloseButton();\n" +
    "    dialog.show();\n" +
    "  }catch(e){ print('[UUID-WL] Failed to open player list: ' + e); }\n" +
    "};\n" +

    "var uuidwlShowConnections = function(){\n" +
    "  try{\n" +
    "    var BaseDialog = Packages.mindustry.ui.dialogs.BaseDialog;\n" +
    "    var Core = Packages.arc.Core;\n" +
    "    var dialog = new BaseDialog('UUID Whitelist - Connection Log');\n" +
    "    dialog.cont.pane(function(list){\n" +
    "      list.margin(10);\n" +
    "      list.add('Click a connection entry to copy its UUID.').padBottom(10).row();\n" +
    "      list.top().left();\n" +
    "      var entries = uuidwlState.connections || [];\n" +
    "      if(entries.length === 0){ list.add('No connections recorded.').pad(10); return; }\n" +
    "      for(var i = entries.length - 1; i >= 0; i--){\n" +
    "        var entry = entries[i];\n" +
    "        var rowText = entry.name + '  |  ' + entry.uuid + '  |  ' + (entry.allowed ? 'ALLOWED' : 'KICKED');\n" +
    "        list.button(rowText, (function(u, n){ return function(){\n" +
    "          try{ Core.app.setClipboardText(u); print('[UUID-WL] Copied UUID of ' + n + ': ' + u); }\n" +
    "          catch(e){ print('[UUID-WL] Failed to copy UUID: ' + e); }\n" +
    "        }; })(entry.uuid, entry.name)).growX().height(55).padBottom(4).row();\n" +
    "      }\n" +
    "    }).grow();\n" +
    "    dialog.addCloseButton();\n" +
    "    dialog.show();\n" +
    "  }catch(e){ print('[UUID-WL] Failed to open connection log: ' + e); }\n" +
    "};\n" +

    "var uuidwl = function(action, value){\n" +
    "  action = valueForUuidWL(action).toLowerCase();\n" +
    "  if(action === 'help' || action === '') {\n" +
    "    print('[UUID-WL] Commands:');\n" +
    "    print('[UUID-WL] uuidwl(\\\"add\\\", \\\"UUID\\\")');\n" +
    "    print('[UUID-WL] uuidwl(\\\"remove\\\", \\\"UUID\\\")');\n" +
    "    print('[UUID-WL] uuidwl(\\\"players\\\") - open player list / copy UUID');\n" +
    "    print('[UUID-WL] uuidwl(\\\"connections\\\") - open connection log / copy UUID');\n" +
    "    print('[UUID-WL] uuidwl(\\\"copy\\\") - copy last connected player UUID');\n" +
    "    print('[UUID-WL] uuidwl(\\\"copy\\\", \\\"UUID\\\") - copy a UUID');\n" +
    "    print('[UUID-WL] uuidwl(\\\"clear\\\")');\n" +
    "    return true;\n" +
    "  }\n" +
    "  if(action === 'players') { uuidwlShowPlayers(); return true; }\n" +
    "  if(action === 'connections' || action === 'log') { uuidwlShowConnections(); return true; }\n" +
    "  if(action === 'copy') {\n" +
    "    var copyUuid = valueForUuidWL(value);\n" +
    "    if(!copyUuid) copyUuid = valueForUuidWL(uuidwlState.lastUUID);\n" +
    "    if(!copyUuid){ print('[UUID-WL] No UUID to copy yet.'); return false; }\n" +
    "    try{ Packages.arc.Core.app.setClipboardText(copyUuid); print('[UUID-WL] Copied UUID: ' + copyUuid); return true; }\n" +
    "    catch(e){ print('[UUID-WL] Failed to copy UUID: ' + e); return false; }\n" +
    "  }\n" +
    "  if(action === 'clear') {\n" +
    "    uuidwlState.list.length = 0;\n" +
    "    if(!uuidwlSave()) return false;\n" +
    "    print('[UUID-WL] UUID whitelist cleared and saved.');\n" +
    "    return true;\n" +
    "  }\n" +
    "  var uuid = valueForUuidWL(value);\n" +
    "  if(!uuid){ print('[UUID-WL] UUID is required. Use uuidwl(\\\"help\\\")'); return false; }\n" +
    "  if(action === 'add') {\n" +
    "    if(uuidwlState.list.indexOf(uuid) >= 0){ print('[UUID-WL] UUID already exists: ' + uuid); return false; }\n" +
    "    uuidwlState.list.push(uuid);\n" +
    "    if(!uuidwlSave()){ uuidwlState.list.pop(); return false; }\n" +
    "    print('[UUID-WL] Added UUID: ' + uuid);\n" +
    "    print('[UUID-WL] Total allowed UUIDs: ' + uuidwlState.list.length);\n" +
    "    return true;\n" +
    "  }\n" +
    "  if(action === 'remove' || action === 'del' || action === 'delete') {\n" +
    "    var idx = uuidwlState.list.indexOf(uuid);\n" +
    "    if(idx < 0){ print('[UUID-WL] UUID not found: ' + uuid); return false; }\n" +
    "    var removed = uuidwlState.list.splice(idx, 1)[0];\n" +
    "    if(!uuidwlSave()){ uuidwlState.list.splice(idx, 0, removed); return false; }\n" +
    "    print('[UUID-WL] Removed UUID: ' + uuid);\n" +
    "    print('[UUID-WL] Total allowed UUIDs: ' + uuidwlState.list.length);\n" +
    "    return true;\n" +
    "  }\n" +
    "  print('[UUID-WL] Unknown action: ' + action);\n" +
    "  print('[UUID-WL] Use uuidwl(\\\"help\\\")');\n" +
    "  return false;\n" +
    "};\n" +
    "function valueForUuidWL(v){ return v == null ? '' : String(v).trim(); }\n";

try{
    var initResult = Vars.mods.getScripts().runConsole(initScript);
    print("[UUID-WL] F8 registration result: " + initResult);
}catch(e){
    print("[UUID-WL] Failed to register F8 command: " + e);
}

// Put initial UUIDs here if you want some entries immediately after load.
var initialUUIDs = [
    // "PASTE_ALLOWED_UUID_HERE",
    // "ANOTHER_ALLOWED_UUID"
];

try{
    var defaults = [];
    for(var i = 0; i < initialUUIDs.length; i++){
        var normalized = normalizeUUID(initialUUIDs[i]);
        if(normalized && defaults.indexOf(normalized) < 0) defaults.push(normalized);
    }
    var loadList =
        "(function(defaults){" +
        "var settings=Packages.arc.Core.settings;" +
        "var saved=settings.getString(uuidwlStorageKey,'');" +
        "if(saved){" +
        "try{" +
        "var parsed=JSON.parse(saved);" +
        "if(parsed && typeof parsed.length==='number'){" +
        "uuidwlState.list=[];" +
        "for(var i=0;i<parsed.length;i++){" +
        "var u=String(parsed[i]).trim();" +
        "if(u && uuidwlState.list.indexOf(u)<0) uuidwlState.list.push(u);" +
        "}" +
        "return 'restored '+uuidwlState.list.length+' UUID(s)';" +
        "}" +
        "}catch(e){print('[UUID-WL] Saved whitelist is invalid: '+e);}" +
        "}" +
        "if(uuidwlState.list.length===0) uuidwlState.list=defaults;" +
        "uuidwlSave();" +
        "return 'initialized and saved '+uuidwlState.list.length+' UUID(s)';" +
        "})(" + JSON.stringify(defaults) + ")";
    print("[UUID-WL] Persistent list: " + Vars.mods.getScripts().runConsole(loadList));
}catch(e){
    print("[UUID-WL] Failed to load persistent UUID list: " + e);
}

// This mod owns the whitelist, so disable Mindustry's built-in whitelist.
try{
    Packages.mindustry.net.Administration.Config.whitelist.set(false);
}catch(e){
    print("[UUID-WL] Could not disable built-in whitelist: " + e);
}

print("[UUID-WL] LOADED - build " + BUILD_ID);
try{
    print("[UUID-WL] Allowed UUIDs: " + Vars.mods.getScripts().runConsole("uuidwlState.list.length"));
}catch(e){
    print("[UUID-WL] Allowed UUIDs: <unknown>");
}
print('[UUID-WL] Use uuidwl("help") in F8 console.');
print('[UUID-WL] Use uuidwl("players") to copy a connected player UUID.');
print('[UUID-WL] Use uuidwl("connections") to browse connection logs and copy UUIDs.');
print('[UUID-WL] Changes to the UUID whitelist are saved automatically.');

Events.on(PlayerConnect, function(event){
    var player = event.player;
    if(player == null) return;

    var uuid = getUUID(player);
    var name = player.name == null ? "Unknown" : String(player.name);
    var allowed = false;

    try{
        allowed = Vars.mods.getScripts().runConsole(
            "(function(u){ return uuidwlState.list.indexOf(String(u).trim()) >= 0; })(" + JSON.stringify(uuid) + ")"
        ) === "true";
    }catch(e){
        print("[UUID-WL] Failed UUID whitelist check: " + e);
    }

    // Save the last UUID and connection history in the shared F8 scope.
    try{
        var recordScript =
            "(function(n,u,a){" +
            "uuidwlState.lastUUID=String(u);" +
            "uuidwlState.connections.push({name:String(n),uuid:String(u),allowed:!!a});" +
            "if(uuidwlState.connections.length>50) uuidwlState.connections.shift();" +
            "return true;" +
            "})(" + JSON.stringify(name) + "," + JSON.stringify(uuid) + "," + (allowed ? "true" : "false") + ")";
        Vars.mods.getScripts().runConsole(recordScript);
    }catch(e){
        print("[UUID-WL] Failed to record connection: " + e);
    }

    print("==============================");
    print("[UUID-WL] PLAYER CONNECTED");
    print("[UUID-WL] Name: " + name);
    print("[UUID-WL] UUID: " + uuid);
    print("[UUID-WL] Allowed: " + allowed);
    print("[UUID-WL] Copy UUID: uuidwl(\"copy\")");
    print("[UUID-WL] Connection log: uuidwl(\"connections\")");
    print("==============================");

    if(!allowed){
        print("[UUID-WL] KICKING " + name + " - UUID not in whitelist");
        try{
            player.con.kick(KICK_REASON);
        }catch(e){
            print("[UUID-WL] Failed to kick player: " + e);
        }
    }
});
