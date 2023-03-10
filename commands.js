export default [
  {
    "name": "grantrole",
    "description": "Grant a role to a user",
    "options": [
      {
        "name": "role",
        "description": "The role to grant",
        "type": 8,
        "required": true,
        "choices": [
          {
            "name": "Role 1",
            "value": "role1_id"
          },
          {
            "name": "Role 2",
            "value": "role2_id"
          },
          {
            "name": "Role 3",
            "value": "role3_id"
          }
        ]
      },
      {
        "name": "user",
        "description": "The user to grant the role to",
        "type": 6,
        "required": true
      }
    ]
  },
  {
    "name": "updateraidtime",
    "description": "Update the next raid time for a specific channel.",
    "options": [
      {
        "name": "month",
        "type": 3,
        "description": "The month of the next raid.",
        "required": true,
        "choices": [
          {
            "name": "January",
            "value": "January"
          },
          {
            "name": "February",
            "value": "February"
          },
          {
            "name": "March",
            "value": "March"
          },
          {
            "name": "April",
            "value": "April"
          },
          {
            "name": "May",
            "value": "May"
          },
          {
            "name": "June",
            "value": "June"
          },
          {
            "name": "July",
            "value": "July"
          },
          {
            "name": "August",
            "value": "August"
          },
          {
            "name": "September",
            "value": "September"
          },
          {
            "name": "October",
            "value": "October"
          },
          {
            "name": "November",
            "value": "November"
          },
          {
            "name": "December",
            "value": "December"
          }
        ]
      },
      {
        "name": "day",
        "type": 3,
        "description": "The day of the next raid (1-31).",
        "required": true
      },
      {
        "name": "year",
        "type": 3,
        "description": "The year of the next raid.",
        "required": true
      },
      {
        "name": "time",
        "type": 3,
        "description": "The time of the next raid in HH:MM format.",
        "required": true
      },
      {
        "name": "raid",
        "type": 3,
        "description": "The name of the next raid.",
        "required": true,
        "choices": [
          {
            "name": "Alexander - The Burden of the Son (Savage)",
            "value": "Alexander - The Burden of the Son (Savage)"
          },
          {
            "name": "Alexander - The Eyes of the Creator (Savage)",
            "value": "Alexander - The Eyes of the Creator (Savage)"
          },
          {
            "name": "Alexander - The Breath of the Creator (Savage)",
            "value": "Alexander - The Breath of the Creator (Savage)"
          },
          {
            "name": "Alexander - The Heart of the Creator (Savage)",
            "value": "Alexander - The Heart of the Creator (Savage)"
          },
          {
            "name": "Alexander - The Soul of the Creator (Savage)",
            "value": "Alexander - The Soul of the Creator (Savage)"
          }
        ]
      },
      {
        "name": "timezone",
        "type": 3,
        "description": "The timezone for the next raid.",
        "required": true,
        "choices": [
          {
            "name": "Eastern Standard Time",
            "value": "GMT-0500"
          },
          {
            "name": "Central Standard Time",
            "value": "GMT-0600"
          },
          {
            "name": "Mountain Standard Time",
            "value": "GMT-0700"
          },
          {
            "name": "Pacific Standard Time",
            "value": "GMT-0800"
          },
          {
            "name": "Alaska Standard Time",
            "value": "GMT-0900"
          },
          {
            "name": "Eastern Daylight Time",
            "value": "GMT-0400"
          },
          {
            "name": "Central Daylight Time",
            "value": "GMT-0500"
          },
          {
            "name": "Mountain Daylight Time",
            "value": "GMT-0700"
          },
          {
            "name": "Pacific Daylight Time",
            "value": "GMT-0700"
          },
          {
            "name": "Alaska Daylight Time",
            "value": "GMT-0800"
          },
          {
            "name": "Hawaii-Aleutian Time",
            "value": "GMT-1000"
          }
        ]
      },
      {
        "name": "channel",
        "type": 7,
        "description": "The name of the channel to update.",
        "required": true
      },
      {
        "name": "is_mine",
        "type": 5,
        "description": "Is this a M.I.N.E raid?",
        "required": false
      }
    ]
  },
  {
    "name": "setavatar",
    "description": "Set the bot's avatar for this server.",
    "options": [
      {
        "name": "url",
        "type": 3,
        "description": "The URL of the image to set as the bot's avatar.",
        "required": true
      }
    ]
  },
  {
    "name": "poll",
    "description": "Create a poll with up to 10 options.",
    "options": [
      {
        "name": "question",
        "description": "The question for the poll.",
        "type": 3,
        "required": true
      },
      {
        "name": "option1",
        "description": "Option 1 for the poll.",
        "type": 3,
        "required": true
      },
      {
        "name": "option2",
        "description": "Option 2 for the poll.",
        "type": 3,
        "required": true
      },
      {
        "name": "option3",
        "description": "Option 3 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option4",
        "description": "Option 4 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option5",
        "description": "Option 5 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option6",
        "description": "Option 6 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option7",
        "description": "Option 7 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option8",
        "description": "Option 8 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option9",
        "description": "Option 9 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "option10",
        "description": "Option 10 for the poll.",
        "type": 3,
        "required": false
      },
      {
        "name": "duration",
        "description": "The duration of the poll in minutes.",
        "type": 4,
        "required": false
      },
    ]
  },
  {
    "name": "kick",
    "description": "Kick a user from the server.",
    "options": [
      {
        "name": "member",
        "description": "The member to kick.",
        "type": 6,
        "required": true
      },
      {
        "name": "reason",
        "description": "The reason for kicking the member.",
        "type": 3,
        "required": false
      }
    ]
  },
  {
    "name": "timeout",
    "description": "Put a user in timeout for a specified duration",
    "options": [
      {
        "name": "user",
        "description": "The user to put in timeout",
        "type": 6,
        "required": true
      },
      {
        "name": "duration",
        "description": "The duration of the timeout in minutes",
        "type": 4,
        "required": true,
        "choices": [
          {
            "name": "60 seconds",
            "value": "1"
          },
          {
            "name": "5 minutes",
            "value": "5"
          },
          {
            "name": "10 minutes",
            "value": "10"
          },
          {
            "name": "1 hour",
            "value": "60"
          },
          {
            "name": "1 day",
            "value": "1440"
          },
          {
            "name": "1 week",
            "value": "10080"
          }
        ]
      },
      {
        "name": "reason",
        "description": "The reason for putting the user in timeout",
        "type": 3,
        "required": false
      }
    ]
  },
  {
    "name": "User Information",
    "type": 2,
  },
  {
    "name": "rules",
    "description": "Add or display server rules.",
    "options": [
      {
        "name": "add",
        "description": "Add a new server rule.",
        "type": 1,
        "options": [
          {
            "name": "rule",
            "description": "The rule to add.",
            "type": 3,
            "required": true
          }
        ]
      },
      {
        "name": "populate",
        "description": "Populate the specified channel with the server rules.",
        "type": 1,
        "options": [
          {
            "name": "channel",
            "description": "The channel to populate with the server rules.",
            "type": 7,
            "required": true
          }
        ]
      },
      {
        "name": "repopulate",
        "description": "Update the specified channel with the server rules.",
        "type": 1,
        "options": [
          {
            "name": "channel",
            "description": "The channel to update with the server rules.",
            "type": 7,
            "required": true
          }
        ]
      }
    ]
  },
]
