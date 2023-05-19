import React, { createRef, useState } from "react";
import { InputHTMLAttributes } from "react";
import { Schema, ValidationError } from "yup";

type Props = {
    attr: InputHTMLAttributes<HTMLInputElement>, 
    id: string, 
    label: string, 
    validator?: Schema,
    children?: any
}

export default class FormInput extends React.Component<Props> {

    input: React.RefObject<HTMLInputElement>;
    state = {
        valid: true,
        error: ""
    }

    constructor(props: Props) {
        super(props);
        this.input = createRef();
    }

    testInput(): boolean {
        this.setState({valid: true});

        if (!this.input.current) return false;
        const value = this.input.current.value;

        if (!this.props.validator) return !!value;
        try {
            this.props.validator.validateSync(value);
            return true;
        } catch (e) {
            if (e instanceof ValidationError) {
                this.setState({valid: false, error: e.errors[0] || "Invalid"})
                return false;
            } else throw e;
        }
    }

    getValue(): string {
        return this.input.current?.value || "";
    }

    render(): React.ReactNode {
        return (
            <div className="w-72 mt-2">
                <div className="flex justify-between font-semibold">
                    <label htmlFor={this.props.id}>{this.props.label}</label>
                    {this.props.children}
                </div>
                <input ref={this.input} type="text" id={this.props.id} name={this.props.id} {...this.props.attr} onChange={()=>this.testInput()} className={`w-full rounded shadow border-[3px] px-1 bg-neutral-100 dark:bg-slate-700 outline-none ${this.state.valid ? 'border-transparent focus:border-blue-500 dark:focus:border-blue-700' : 'border-red-500'}`}></input>
                {!this.state.valid && <div className="text-sm text-red-500">{this.state.error}</div>}
            </div>
        )
    }
}