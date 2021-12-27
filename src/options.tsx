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

    return (
        <>
            {options.map(option => (
                <div>{option}</div>
            ))}

        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById("root")
);
