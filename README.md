# DoorMaster

This [Roll20](http://roll20.net/) script provides a robust system of door creation and management. It allows players to interact with doors, attempt to pick locks, or try to break through doors. GMs can create hidden doors that can be revealed to players at any time, provide any number of paths to serve as Dynamic Lighting lines, include switches for alternative door control, and add a token to visually illustrate a broken door. You have the option to lock all related tokens to prevent them from accidentally being moved.

DoorMaster is currently only for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped).

## Door Creation

There are a minimum of two tokens needed to create a door: A token named "Closed" representing the door in its closed State, and one named "Open" for when it is open. The Closed token will contain the startup information for the door. Aside from the name, you will set the [State](#door-states) of the door and its [Visibility](#door-visibility). You can also provide the "Lock DC" for when a player attempts to pick the lock. If none is provided, it will default to 12. The "Break DC" is used when a character attempts to open the door by force. If none is provided, it will default to 30 for Barred doors and 15 for all others.

Below is the information to provide and the field placement for each:

|  | Current | Max |
| ---- |:----:|:----:|
| Bar 1 | State | Visibility |
| Bar 2 | Lock DC  | Break DC |

If you wish to use a switch, lever, or other off-the-door method of opening and closing the door, provide a token named "Switch". This token will be the one players interact with regardless of where the door is located.

You can also use a token named "Broken" to depict the door in a broken, unusable State. If an attempt to break a door down results in the Broken State, this token will replace the Open or Closed tokens and will not be available for player interaction.

Paths for Dynamic Lighting are optional, and you can provide more than one for things like prison bars. These will all act as Dynamic Lighting lines in the Closed State, and will be disabled in the Open State.

When you have all of the elements for your door, you select all of them and send the `!door create` command in chat. This assembles your door and closes it. A status window for the door will appear, where you can update or modify most of the door's settings. It will also allow you to lock all related tokens to prevent accidental movement. You can return to this [Status window](#door-status) at any time.

**Note:** This process replaces token names with the ID of the associated door. *Do not* rename tokens after your door is created or your door will not function.

## Door States

Each door will have on of the following States. Typically, you will only use the first four when creating a door. The last two are set by DoorMaster when certain conditions are met:
- *Unlocked* - Players can open and close the door effortlessly.
- *Locked* - The door has a lock that that either needs a key or can be picked open.
- *Barred* - This door is barred or obstructed from the opposite side. It cannot be picked or busted through.
- *Stuck* -  This door is not locked, but won't open without being forced.
- *Disabled* - A disabled door has had its lock damaged. It cannot be unlocked with a key or by picking it.
- *Broken* - A broken door has been damaged to the point it is unusable. These doors are always open and cannot be closed by any means.  You *cannot* set this State during [door creation](#door-creation).

You can change the door's State at any time in the [Status window](#door-status) with any one of the door's tokens selected. Note that setting an open door to the Locked State will close that door as well.

## Door Visibility

Visible doors will be assigned the DoorMaster character (see below) and [optionally](#configuration) be given an aura to indicate a door with which the players can interact. If you want to create a Secret or Concealed door, you *must* indicate this during [door creation](#door-creation). Place either "Secret" or "Concealed" in the bar 1 max field of the Closed token ([see above](#door-creation)).

Even Unlocked doors that are Secret or Concealed will be undetectable by players, assuming the graphics you use blend into the map. They will not receive a player-visible aura and will not be assigned the DoorMaster character. They *will* receive a gm-only aura to show it as a hidden door. The [Status window](#door-status) will provide a link to reveal a hidden door, but a visible door cannot be made Secret or Concealed.

## DoorMaster Character

For all visible doors, a DoorMaster character - created automatically when you first install the script - is set on the appropriate door tokens to allow players to interact with them. This character is essential for player interaction and *must not be deleted.*

This character has four token action buttons:
- *Use Door* - This should be the first used button. It will open and close Unlocked doors, and provides feedback on the State of the door if it cannot be opened.
- *Pick Lock* - This action begins the steps to make an attempt to pick a lock. If the player controls more than one character, they will be asked to select which character is making the attempt. The list of characters will only include characters to which the player has specifically been assigned control, i.e. no character with the "All Players" assignment.

  The player will then be provided a "Pick Lock" button which will allow them to select the Dexterity skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to pick a lock.

   If enabled in [config](#configuration), a fumble at trying to pick the lock can result in the lock being Disabled. This prevents use of a key or subsequent attempts to pick the lock.
- *Break Door* - This action begins an attempt to open the door by force. As above, if the player controls more than one character, they will be asked to select which character is making the attempt.

  The player will then be provided a "Force Door" button which will allow them to select the Strength skill to use for the attempt and to indicate if that character has Advantage or Disadvantage on the roll. The GM will be notified of all attempts to break a door.

   If the attempt to force the door open succeeds, there is a 20% chance to break the door (setting it to the Broken [State](#door-states)) completely, rendering the door useless. If a Locked door is forced open, there is also a 10% chance to destroy the lock (Disabled).
- *Help* Shows a help menu that explains the other token actions.

## Door Status

You can see the stats for any door by using the `!door status` command with any door token selected. You will be provided the following information:
- Whether the door is open or closed
- The [State](#door-states) of the door (editable)
- The [Visibility](#door-visibility) of the door (reveal only)
- The current Lock DC (editable)
- The current Break DC (editable)
- Whether there is a Switch being used
- Whether there is a Broken graphic
- Whether the tokens are locked (lockable)

## Configuration

The Configuration Menu allows you to change the DoorMaster options:
- **Door Auras** You can use an aura to indicate to players that a door token can be interacted with. The default is "on" and the color is set to an unobtrusive medium grey. You can turn this feature off and on, and change the color.
- **Hidden Door Indicator** This is a aura used to show the GM a door that is Secret or Concealed. You cannot turn it off, but you can change the color.
- **Lock Picking Fumbles** You can choose to allow fumbles at lock picking attempts to disable the door's lock (Disabled), preventing it from being unlocked by key or more picking attempts. Default is On.
- **Show Results** You can choose to show players the results of their lock picking and door breaking attempts. If turned off, players will only see a "success" or "fail" dialog. If on, this dialog will also include the roll result, the skill they used, and whether or not they rolled at Advantage or Disadvantage. Default is Off. *These results are always provided to the GM.*

The Configuration Menu also tells you how many doors you've created so far, and gives a button for [creating a door](#door-creation) or viewing a selected door's [status](#door-status).

## Destroying Doors

Sometimes you may need to remove a previously created door, in case a token has been deleted or missed during creation. To do this, select any of the door's tokens and use the `!door destroy` command. This will remove the DoorMaster character from the tokens, put their respective names back ("Closed" on the Closed token, etc.), unlock the tokens if they have been locked, remove any auras, and return all existing tokens and paths to the token layer. The Closed token will have the current State, Visibility, and DCs written to the appropriate fields.
