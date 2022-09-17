let matrix = [[],[],[]];
let winMatrix = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", " "]
];
let allMatrixes = [];
let cells = document.querySelectorAll('.number');
const getMatrixCopy = (area) => area.map(arr => {return [...arr]});

function fillGame()
{
    let allFilled = true;
    for (let cell of cells) {
        if (cell.value == "") {
            allFilled = false
        }
    }
    if (allFilled == true) {
        let i = 0;
        let j = 0;
        for (let cell of cells) {
            matrix[i].push(cell.value);
            j++;
            if (j == 3)
            {
                j = 0;
                i++;
            }
        }
        createOptions(matrix, 0, 9);
        let besties = countBest();
        let opt = allMatrixes[allMatrixes.length - 1].h + 2;
        let eff = ((opt/(allMatrixes.length))*100).toFixed();
        let res = document.querySelector('.result');
        res.innerHTML = "Количество вершин: " + allMatrixes.length.toString() + ", из них " + besties.toString() + " лучших и " + opt.toString() + " оптимальных. <br> Эффективность тактики = " + eff.toString() + "%.";
        createTree();
    }
}

function createOptions(area, h, min) {
    let empty = findIndex(area, " ");
    let empty_i = empty[0];
    let empty_j = empty[1];
    let currentMatrix = getMatrixCopy(area);
    for (let i = 0; i < 3; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            if (((i == empty_i && Math.abs(j - empty_j) == 1) || (j == empty_j && Math.abs(i - empty_i) == 1)))
            {
                currentMatrix[empty_i][empty_j] = currentMatrix[i][j];
                currentMatrix[i][j] = " ";
                if (findCopies(currentMatrix) == false) {
                    let arr = {
                        area: currentMatrix,
                        h: h,
                        g: findG(currentMatrix),
                        checked: false,
                        f: 0
                    }
                    arr.f = arr.h + arr.g;
                    allMatrixes.push(arr);
                    console.log(allMatrixes);
                }
                currentMatrix = getMatrixCopy(area);
            }
        }
    }
    let findNextResults = findBestOption(h, min);
    let newArr = findNextResults[0];
    let newG = findNextResults[1];
    let newH = findNextResults[2] + 1;
    let newF = findNextResults[3];
    if (checkWin(newArr) == false) {
        createOptions(newArr, newH, newF);
    }
    else {
        console.log("victory!");
    }
}

function countBest() {
    let counter = 0;
    for (let arr of allMatrixes) {
        if (arr.checked == true) {
            counter++;
        }
    }
    return counter;
}

function findCopies(arr2) {
    let match = true;
    for (let arr of allMatrixes) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (arr2[i][j] != arr.area[i][j]) {
                    match = false;
                }
            }
        }
        if (match == true) 
        {
            return true; //it already exists
        } else {
            match = true;
        }
    }
    return false;
}

function checkWin(arr) {
    let match = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (arr[i][j] != winMatrix[i][j]) {
                match = false;
                break;
            }
        }
    }
    return match;
}

function findBestOption(h, min) {
    let changed = false;
    let nextMatrix = [];
    let curr_g = 9;
    let curr_h = h;
    let result = [];
    for (let arr of allMatrixes) {
        // если на рассматриваемом уровне была найдена непроверенная матрица с f <= минимуму (их может быть несколько)
        if (arr.h == h && arr.checked == false && arr.f <= min) {
            min = arr.f;
            curr_g = arr.g;
            changed = true;
            nextMatrix = getMatrixCopy(arr.area);
        }
    }
    // если на рассматриваемом уровне была найдена непроверенная матрица с f <= минимуму
    if (changed == true) {
        // отбираем одну из них - ту, которую последней поместили в nextMatrix
        for (let arr of allMatrixes) {
            if (arr.f == min) {
                let match = true;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (arr.area[i][j] != nextMatrix[i][j]) {
                            match = false;
                        }
                    }
                }
                // если нашли такую, которая сейчас в nextMatrix 
                if (match == true) {
                    // пометили её лучшей (ещё не оптимальной)
                    arr.checked = true;
                    curr_g = arr.g;
                    break;
                }
            }
        }
        result = [nextMatrix, curr_g, h, curr_g+h];
        return result;
    }
    // если непроверенная матрица с f <= минимуму не была найдена
    else {
        // если проверялся 0 уровень и выше не рассмотреть
        if (h == 0) {
            // необходимо найти второй минимум и искать его на самом нижнем уровне
            // поиск второго минимума
            let newMin = findSecondMin(min);
            min = newMin;
            // поиск нижнего уровня
            let maxH = 0;
            for (let arr of allMatrixes) {
                if (arr.h > maxH) {
                    maxH = arr.h;
                }
            }
            h = maxH;
            result = findBestOption(h, min);
            return result;
        }
        else {
            // ищем текущий минимум на предыдущих уровнях
            h = h - 1;
            result = findBestOption(h, min);
            return result;
        }
    }
}

function findIndex(arr, el) {
    for (let i = 0; i < 3; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            if (arr[i][j] == el)
            {
                return [i, j]
            }
        }
    }
}

function findG(currentMatrix)
{
    let g = 0;
    for (let i = 0; i < 3; i++)
    {
        for (let j = 0; j < 3; j++)
        {
            if (currentMatrix[i][j] != winMatrix[i][j])
            {
                g++
            }
        }
    }
    return g;
}

function findSecondMin(min) {
    let secondMin = 10000;
    for (let arr of allMatrixes) {
        let f = arr.h + arr.g;
        if (f > min && f <= secondMin) {
            secondMin = f;
        }
    }
    return secondMin;
}

function createTree() {
    let bestMatrixes = [];
    let tactic = document.querySelector('.tactic');
    let maxH = allMatrixes[allMatrixes.length - 1].h;
    let lastMatrix = [];
    for (let arr of allMatrixes) {
        if (arr.h == maxH && arr.checked == true) {
            lastMatrix = getMatrixCopy(arr.area);
        }
    }
    bestMatrixes.push({area: lastMatrix, h: maxH});
    for (let x = maxH - 1; x >= 0; x--) {
        for (let arr of allMatrixes) {
            if (arr.h == x && arr.checked == true) {
                let count = 0;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (arr.area[i][j] != lastMatrix[i][j]) {
                            count++;
                        }
                    }
                }
                if (count == 2) {// это перестановка ластматрикс 
                    lastMatrix = getMatrixCopy(arr.area);
                    bestMatrixes.push({area: lastMatrix, h: x});
                }
            }
        }
    }
    bestMatrixes.push({area: matrix, h: -1});
    console.log(bestMatrixes);
    for (let x = maxH + 1; x >= 0; x--) {
        let el = document.createElement('div');
        el.className = "tactic__area";
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let child = document.createElement('div');
                child.className = "tactic__cell";
                child.innerHTML = bestMatrixes[x].area[i][j];
                el.appendChild(child);
            }
        }
        let arrow = document.createElement('div');
        arrow.className = "arrow";
        arrow.innerHTML = ">";
        tactic.appendChild(el);
        if (x != 0) {
            tactic.appendChild(arrow);
        }
    }
}