# DoorMaster

> **New in 3.0:** Doors can now have actual keys! Also, switches can be hidden, revealed later manually.

This [Roll20](http://roll20.net/) script provides a robust system of door creation and management. It allows players to interact with doors, attempt to pick locks, or try to break through doors. GMs can create hidden doors that can be revealed to players at any time, provide any number of paths to serve as Dynamic Lighting lines, include switches for alternative door control, and add a token to visually illustrate a broken door. You have the option to lock all related tokens to prevent them from accidentally being moved.

DoorMaster is currently only for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped).

## Door Creation

There are a minimum of two tokens needed to create a door: A token named "Closed" representing the door in its closed State, and one named "Open" for when it is open. The Closed token will contain the startup information for the door. Aside from the name, you will set the [State](#door-states) of the door and its [Visibility](#door-visibility). You can also provide the "Lock DC" for when a player attempts to pick the lock. If none is provided, it will default to 12. The "Break DC" is used when a character attempts to open the door by force. If none is provided, it will default to 30 for Barred doors and 15 for all others. If making a Keyed door ([see below](#keyed-doors)), the Passphrase will be provided here.

Below is the information to provide and the field placement for each:

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | State | Visibility |
| Bar 2 | Lock DC | Break DC |
| Bar 3 | [Passphrase](#keyed-doors) |  |

If you wish to use a switch, lever, or other off-the-door method of opening and closing the door, provide a token named "Switch" ([see below](#switches)).

You can use an optional token named "Broken" to depict the door in a broken, unusable State. If an attempt to break a door down results in the Broken State, this token will replace the Open or Closed tokens and the door will no longer be available for player interaction.

Paths for Dynamic Lighting are optional. You can use no paths at all for trapdoors, or provide more than one path for things like prison bars. These will all act as Dynamic Lighting lines in the Closed State, and will be disabled in the Open State.

When you have all of the elements for your door, you select all of them and send the `!door create` command in chat. This assembles your door and closes it. A status window for the door will appear, where you can update or modify most of the door's settings. It will also allow you to lock all related tokens to prevent accidental movement or [link other doors](#linked-doors). You can return to this [Status window](#door-status) at any time.

**Note:** The creation process replaces token names with the ID of the associated door. *Do not* rename tokens after your door is created or your door *will not* function.

## Door States

Each door will have on of the following States. Typically, you will only use the first five when [creating a door](#door-creation). The last two are set by DoorMaster when certain conditions are met:
- *Unlocked* - Players can open and close the door effortlessly.
- *Locked* - The door has a lock that either needs a key or can be picked open.
- *Keyed* - The door has a lock with which the player can interact. This status is **only** used to tell DoorMaster that the door is [Keyed](#keyed-doors), and will be converted to the Locked State during door creation.
- *Barred* - This door is barred or obstructed from the opposite side. It cannot be picked or busted through.
- *Stuck* -  This door is not locked, but won't open without being forced.
- *Disabled* - A disabled door has had its lock damaged. It cannot be unlocked with a key or by picking it.
- *Broken* - A broken door has been damaged to the point it is unusable. These doors are always open and cannot be closed by any means. You *cannot* set this State during door creation.

You can change the door's State at any time in the [Status window](#door-status) with any one of the door's tokens selected. Note that setting an open door to a Locked, Barred, or Stuck State will close that door as well.

## Door Visibility

Visible doors will be assigned the DoorMaster character (see below) and ([optionally](#configuration)) be given an aura to indicate a door with which the players can interact. If you want to create a Secret or Concealed door, you *must* indicate this during [door creation](#door-creation). Place either "Secret" or "Concealed" in the bar 1 max field of the Closed token ([see above](#door-creation)).

Even Unlocked doors that are Secret or Concealed will be undetectable by players, assuming the graphics you use blend into the map. They will not receive a player-visible aura and will not be assigned the DoorMaster character. They *will* receive a gm-only aura to show it as a hidden door. The [Status window](#door-status) will provide a link to reveal a hidden door, but a visible door cannot be made Secret or Concealed.

## Switches

Switches are optional tokens that enable operation of the door from a remote location, be it across the room or down a hallway. Select a graphic you wish to use for the switch and name it "Switch". If you want to hide your Switch until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Switch token. The [Status window](#door-status) will provide a link for revealing the Switch.

If you want to have an "on/off" effect for your Switch, provide a second token named "Switch2". When the switch is used on an Unlocked door, DoorMaster will toggle between the two switch tokens.

## Keyed Doors

Doors can have "keys" to unlock them. These are passphrases - passwords or sentences - that you provide. To create such a door, use "Keyed" as the door [State](#door-states) during [door creation](#door-creation) and enter the passphrase you wish to use in the first Bar 3 box. Upon creation, the door will be Locked and you will have the following additional functionality in the [Status window](#door-status):
- The ability to manually enable the use of a "Use Key" token action button. This button lets players enter a passphrase in an attempt to unlock the door. Until enabled, the door will only have the usual [token action buttons](#doormaster-characters) available.
- The passphrase will be displayed, which you can change at any time.
- You can choose to remove the "Use Key" token action whenever the door is unlocked with the proper passphrase. By default this "Key Reset" function is OFF, allowing players to *lock* the door with the passphrase as well.

Passphrases should be alphanumeric and may contain punctuation and spaces, but you should avoid characters used in URLs (colons, forward slashes, etc.). They do not have to be unique, but remember that entering a non-unique passphrase on one door will not unlock other doors with the same passphrase.

## Lock Tokens

If you have a [Keyed Door](#keyed-doors) and wish to provide key input separate from the door itself, you can provide a token named "Lock". This especially handy when creating doors that are locked by magical means - puzzles, etc. - that can reveal the passcode after the puzzle or test is completed correctly. This Lock token will be the token with which players must interact when using a key or attempting to pick the lock.

If you want to hide your Lock until a later time - it is concealed or otherwise hidden - put "Hidden" in the first Bar 1 field of the Lock token. The [Status window](#door-status) will provide a link for revealing the Lock.

## Linked Doors

You can create a link to one or more other doors via the [Status window](#door-status). This makes the door referenced by the Status window the "master" door and all linked doors are "secondary" doors. When the master door is opened, the secondary doors are opened (as long as they are Unlocked). This is a one-way link, so opening a secondary door does not affect the master. Two-way connections can be made simply by linking the secondary door back to the master.

Linking doors in this way provides for any number of effects:
- Allow one switch to *control multiple doors.* Create switches for every door in the group, then hide all but the master switch behind Dynamic Lighting lines.
- Create a lever that *changes walls in a labyrinth.* This is almost the same as the above, but all secondary doors are all Secret, Unlocked doors that act as walls and dividers in the labyrinth. Only the master door needs a switch.
- *Create a puzzle* where players must make all the doors in the group opened or closed. Secondary doors are linked to the master and other secondary doors in such a way that only by using the doors in the correct sequence will have them all closed or open at once.
- Make doors with *multiple switches.* Create two switched doors, and either hide the secondary door's tokens behind Dynamic Lighting lines or use transparent graphics to leave only the switch token accessible.
- Make doors operated by other doors or switches *on another page.* Generate the status window for the master door, then jump to another page and link the door you want.

Once you have linked doors, there is an "all-or-nothing" toggle. Setting this to "ON" will require all of the doors to be Unlocked before any of them will open. If set to "OFF", all Unlocked doors in the group will be opened/closed and the rest will be ignored. Broken doors are the exception for the toggle and will allow operation when all-or-nothing is ON. If there are any non-Unlocked secondary doors, the GM will be notified.

The master door *must* be Unlocked to operate any secondary doors. If it is not, players will receive the standard feedback based on the master door's [State](#door-states).

## DoorMaster Characters

DoorMaster characters are created automatically when you first install the script, and are set on the appropriate tokens to allow players to interact with them. These characters are essential for player interaction and *must not be deleted.*

The "DoorMaster" character is used for all visible doors and has four token action buttons:
- *Use* - Use a door or switch. This should be the first button used. It will open and close Unlocked doors, and provides feedback on the State of the door if it cannot be opened.
- *Pick* - This button begins the steps to make an attempt to pick a lock. If the player controls more than one character, they will be asked to select which character is making the attempt. The list of characters will only include characters to which the player has specifically been assigned control, i.e. no character with the "All Players" assignment.

  The player will then be provided a "Pick Lock" button which will allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to pick a lock.

   If enabled in [config](#configuration), a fumble at trying to pick the lock can result in the lock being Disabled. This prevents use of a key or subsequent attempts to pick the lock.
- *Break* - This button begins an attempt to open the door by force. As above, if the player controls more than one character, they will be asked to select which character is making the attempt.

  The player will then be provided a "Force Door" button which will allow them to select the Strength skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to break a door.

   If the attempt to force the door open succeeds, there is a 20% chance to break the door (setting it to the Broken [State](#door-states)) completely, rendering the door useless. If a Locked door is forced open, there is also a 10% chance to destroy the lock (Disabled).
- *Help* Shows a help menu that explains the other token action buttons.

The "DoorMaster Keyed" character adds the following token action button:
- *Key* - This button prompts the player to enter a passphrase. If the passphrase is correct, the door will be unlocked. If the [key reset function](#keyed-doors) is off, this button will also allow the door to be locked using the passphrase as well.

The "DoorMaster Switch" character is set on non-hidden switch tokens, and only provides the *Use* and *Help* buttons.

The "DoorMaster Lock" character is set on non-hidden lock tokens, and provides the *Key*, *Pick*, and *Help* buttons.

## Door Status

You can see the stats for any door by using the `!door status` command with any door token selected. You will be provided the following information:
- Whether the door is open or closed
- The [State](#door-states) of the door (editable)
- The [Visibility](#door-visibility) of the door (reveal only)
- The current Lock DC (editable)
- The current Break DC (editable)
- If [keyed](#keyed-doors), whether the lock is enabled (enable only)
- If keyed, shows the passphrase (editable)
- If keyed, shows if Key Reset is on or off (toggle)
- Whether there is a Switch, and its visibility (reveal only)
- Whether there is a Broken graphic
- Whether the tokens are locked (lockable)

## Configuration

The Configuration Menu allows you to change thsee DoorMaster options:
- **Door Auras** You can use an aura to indicate to players that a door token can be interacted with. The default is "on" and the color is set to an unobtrusive medium grey. You can turn this feature off and on, and change the color.
- **Hidden Door Indicator** This is a aura used to show the GM a door that is Secret or Concealed. You cannot turn it off, but you can change the color.
- **Lock Picking Fumbles** You can choose to allow fumbles at lock picking attempts to disable the door's lock (Disabled), preventing it from being unlocked by key or more picking attempts. Default is On.
- **Show Results** You can choose to show players the results of their lock picking and door breaking attempts. If turned off, players will only see a "success" or "fail" dialog. If on, this dialog will also include the roll result, the skill they used, and whether or not they rolled at Advantage or Disadvantage. Default is Off. *These results are always provided to the GM.*

The Configuration Menu also tells you how many doors you've created so far, and gives a button for [creating a door](#door-creation) or viewing a selected door's [status](#door-status).

## Destroying Doors

Sometimes you may need to remove a previously created door, in case a token has been deleted or missed during creation. To do this, select any of the door's tokens and use the `!door destroy` command. This will remove the DoorMaster character from the tokens, put their respective names back ("Closed" on the Closed token, etc.), unlock the tokens if they have been locked, remove any auras, and return all existing tokens and paths to the token layer. The Closed token will have the current State, Visibility, and DCs written to the appropriate fields.
