import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { allModules } from "./content_script"
import { config } from "./Storage/api"


const divStyle = {
    border: "1px solid black",
};


const Options = () => {
    const [options, setOptions] = useState(Array<JSX.Element>())

    useEffect(() => {
        config.onload(() => {
            let ops = allModules.map(m => m.options ? m.options(config) : undefined).filter(o => o != undefined) as Array<JSX.Element>
            setOptions(ops)
        })
    }, []);

    return (
        <>
            {options.map((option) => (
                <div style={divStyle}>
                    {option}
                </div>
            ))}
        </>
    );
};

export { Options };

ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById("root")
);
