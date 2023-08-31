

function calcDate(min, max){
        const diff = max-min;
        const secs = diff%60;
        const minutes = (diff - secs)/60;
        const min_rest = minutes%60;
        const hours = (minutes - min_rest)/60;
        return [hours, min_rest, secs];
}

module.exports = {calcDate};
