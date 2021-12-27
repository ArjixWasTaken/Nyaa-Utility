import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { allModules } from "./content_script"
import { config } from "./Storage/api"

const Options = () => {
    const [options, setOptions] = useState(Array<JSX.Element>())

    useEffect(() => {
        allModules.forEach(module => {
            config.onload(() => {
                const ops = module.options(config)
                if (ops != undefined) {
                    setOptions([...options, ops])
                }
            })
        })
    }, []);

    const saveOptions = () => {
        document.write(options[0].toString())
    };

    return (
        <>
            <div>
                {options.map(option => (
                    <div>{option}</div>
                ))}
            </div>
            <button onClick={saveOptions}>Save</button>
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById("root")
);
