function freeze(func, ms) {

    let isFreeze = false;

    function wrapper() {
        if(isFreeze) return;

        func.apply(this, arguments);

        isFreeze = true;

        setTimeout(function() {
            isFreeze = false;
        }, ms);
    }

    return wrapper;
}

export default freeze;
