const consts = {
    rarityColors: {
        // [fill, outline]
        common: ['#7eef6d', '#66c258'],
        uncommon: ['#ffe65d', '#ceba4c'],
        rare: ['#5e4de3', '#4c3eb8'],
        epic: ['#861fde', '#6d19b4'],
        legendary: ['#de1f1f', '#b71a1a'],
        // lol i wont use these 3
        unique: ['#df1f67', '#b81752'],
        mythic: ['#36b1d6', '#279ec0'],
        omnipotent: ['#969696', '#787878'],
    },
    rarityToNumber: {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5,
        unique: 6,
        mythic: 7,
        omnipotent: 8
    },
    deadDecayTime: 300,
}