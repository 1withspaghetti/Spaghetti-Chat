type Data = Record<string, any> & {id: number};

export function globalArrayReducer(sort: (a: Data, b: Data) => number) {
    return (array: {id: number}[], payload: {action: 'set'|'add'|'edit'|'delete'|'editMember'|'editAuthor', data: Data|Data[]}) => {
        switch (payload.action) {
            case 'add':
                if (payload.data instanceof Array) {
                    let toDelete = payload.data.map(item => item.id);
                    return [...array.filter(e=>!toDelete.includes(e.id)), ...payload.data].sort(sort as any);
                } else
                    return [...array.filter(e=>e.id!=(payload.data as Data).id), payload.data].sort(sort as any);
            case 'edit':
                if (payload.data instanceof Array) {
                    let toEdit = payload.data.map(item => item.id);
                    return array.map(item => toEdit.includes(item.id) ? (payload.data as any[]).find(i => i.id === item.id) : item).sort(sort);
                } else {
                    return array.map(item => item.id === (payload.data as any).id ? payload.data : item).sort(sort as any);
                }
            case 'delete':
                if (payload.data instanceof Array) {
                    let toDelete = payload.data.map(item => item.id);
                    return array.filter(item => !toDelete.includes(item.id));
                } else {
                    return array.filter(item => item.id !== (payload.data as any).id);
                }
            case 'set':
                return payload.data instanceof Array ? payload.data.sort(sort) : [payload.data];

            case 'editMember':
                if (payload.data instanceof Array) {
                    let toEdit = payload.data.map(item => item.id);
                    return array.map((channel: any) => (
                        {...channel, members: (channel.members as any[] || []).map(member => 
                            toEdit.includes(member.id) ? (payload.data as any[]).find(i => i.id === member.id) : member)
                        }
                    )).sort(sort);
                } else {
                    return array.map((channel: any) => {
                        return {...channel, members: (channel.members as any[] || []).map(member => ((payload.data as Data).id === member.id) ? payload.data : member)}
                    }).sort(sort);
                }
            case 'editAuthor':
                if (payload.data instanceof Array) {
                    let toEdit = payload.data.map(item => item.id);
                    return array.map((message: any) => (
                        {...message, author: toEdit.includes(message.author.id) ? (payload.data as any[]).find(i => i.id === message.author.id) : message.author}
                    )).sort(sort);
                } else {
                    return array.map((message: any) => {
                        return {...message, author: ((payload.data as Data).id === message.author.id) ? payload.data : message.author}
                    }).sort(sort);
                }
            default:
                return array;
        }
    }
}

export function globalObjectReducer(object: Record<string, any>, payload: {action: 'set'|'edit', data: any}): Record<string, any> {
    switch (payload.action) {
        case 'set':
            return payload.data;
        case 'edit':
            if (payload.data.id !== object.id) return object;
            return {...object, ...payload.data};
        default:
            return object;
    }
}
