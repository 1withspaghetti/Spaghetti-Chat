import React, { createRef, useState } from "react";
import { InputHTMLAttributes } from "react";
import { Schema, ValidationError } from "yup";

type Props = {
    attr?: InputHTMLAttributes<HTMLInputElement>, 
    id: string, 
    label: string, 
    validator?: Schema,
    children?: any,
    width?: number,
    class?: string,
    noShift?: boolean,
    initialVal?: string,
    value?: [string|undefined, (val: string)=>void]
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

        if (!this.props.validator) return true;
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

    setValue(val: string) {
        this.input.current!.value = val;
        this.testInput();
    }

    getValue(): string {
        return this.input.current?.value || "";
    }

    render(): React.ReactNode {
        return (
            <div className="w-full relative" style={{maxWidth: `${this.props.width || 288}px`}}>
                <div className="flex justify-between font-semibold">
                    <label htmlFor={this.props.id}>{this.props.label}</label>
                    {this.props.children}
                </div>
                <input 
                    ref={this.input} 
                    type="text" 
                    id={this.props.id} 
                    name={this.props.id} 
                    onChange={()=>{this.testInput(); if (this.props.value) this.props.value[1](this.input.current!.value)}} 
                    value={this.props.value && this.props.value[0]} 
                    className={`peer w-full rounded shadow border-[3px] px-1 bg-neutral-100 dark:bg-slate-700 outline-none ${this.state.valid ? 'border-transparent focus:border-blue-500 dark:focus:border-blue-700' : 'border-red-500'} ${this.props.class || ''}`} 
                    {...this.props.attr}>
                </input>
                { this.props.noShift ? 
                    (this.props.validator && !this.state.valid) && <div className="px-2 py-2 h-fit rounded-lg shadow-lg hidden peer-focus:block peer-hover:block absolute z-40 bg-black bg-opacity-50 backdrop-blur-sm text-sm text-red-500">{this.state.error}</div>
                :
                    (this.props.validator) && <div className="text-sm text-red-500">{!this.state.valid && this.state.error}</div>
                }
            </div>
        )
    }
}