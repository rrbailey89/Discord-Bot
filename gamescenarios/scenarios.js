const scenarios = [
	{
		id: 1,
		description: 'You find yourself at the entrance of a mysterious cave. What do you do?',
		actions: [
			{ input: 'enter', result: 2 },
			{ input: 'leave', result: 3 },
		],
	},
	{
		id: 2,
		description: 'You enter the cave and find a treasure chest. What do you do?',
		actions: [
			{ input: 'open', result: 4 },
			{ input: 'leave', result: 3 },
		],
	},
	{
		id: 3,
		description: 'You leave the cave and find yourself back at the entrance. What do you do?',
		actions: [
			{ input: 'enter', result: 2 },
			{ input: 'turn around', result: 5 },
		],
	},
	{
		id: 4,
		description: 'You open the treasure chest and find a sword. What do you do?',
		actions: [
			{ input: 'take', result: 9 },
			{ input: 'leave', result: 3 },
		],
	},
	{
		id: 5,
		description: 'You turn around and see the road that led to the cave. The road forks to the left and right. What do you do?',
		actions: [
			{ input: 'take the left fork', result: 6 },
			{ input: 'take the right fork', result: 7 },
			{ input: 'walk straight', result: 8 },
		],
	},
	{
		id: 6,
		description: 'You take the left fork and come to an old man resting under a tree. What do you do?',
		actions: [
			{ input: 'speak to the man', result: 11 },
			{ input: 'ignore the man', result: 12 },
		],
	},
	{
		id: 7,
		description: 'You take the right fork and come to a river. What do you do?',
		actions: [
			{ input: 'cross the river', result: 13 },
			{ input: 'turn around', result: 5 },
		],
	},
	{
		id: 8,
		description: 'You walk straight and come to a town. What do you do?',
		actions: [
			{ input: 'enter the town', result: 14 },
			{ input: 'turn around', result: 5 },
		],
	},
	{
		id: 9,
		description: 'You take the sword and hear a shuffling noise coming from behind you. What do you do?',
		actions: [
			{ input: 'turn around', result: 7 },
			{ input: 'duck', result: 8 },
			{ input: 'run left', result: 9 },
			{ input: 'run right', result: 10 },
		],
	},
	{
		id: 10,
		description: 'You run right and come to a wall. What do you do?',
		actions: [
			{ input: 'climb the wall', result: 15 },
			{ input: 'turn around', result: 16 },
		],
	},
	{
		id: 11,
		description: 'You speak to the old man under the tree. He tells you that he is a wizard and that he can grant one wish. What do you wish for?',
		actions: [
			{ input: 'eternal rest', result: 17 },
			{ input: 'eternal youth', result: 18 },
			{ input: 'eternal wealth', result: 19 },
		],
	},
	{
		id: 12,
		description: 'You ignore the old man under the tree. He curses you and you die.',
		actions: [],
	},

];

export default scenarios;
