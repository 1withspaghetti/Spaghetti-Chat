type Data = Record<string, string> & {id: number};

export function globalArrayReducer(array: {id: number}[], payload: {action: 'set'|'add'|'edit'|'delete'|'editMember', data: Data|Data[]}) {
    switch (payload.action) {
        case 'add':
            if (payload.data instanceof Array) {
                return [...array, ...payload.data];
            } else
                return [...array, payload.data];
        case 'edit':
            if (payload.data instanceof Array) {
                let toEdit = payload.data.map(item => item.id);
                return array.map(item => toEdit.includes(item.id) ? (payload.data as any[]).find(i => i.id === item.id) : item);
            } else {
                return array.map(item => item.id === (payload.data as any).id ? payload.data : item);
            }
        case 'delete':
            if (payload.data instanceof Array) {
                let toDelete = payload.data.map(item => item.id);
                return array.filter(item => !toDelete.includes(item.id));
            } else {
                return array.filter(item => item.id !== (payload.data as any).id);
            }
        case 'set':
            return payload.data instanceof Array ? payload.data : [payload.data];

        case 'editMember':
            if (payload.data instanceof Array) {
                let toEdit = payload.data.map(item => item.id);
                return array.map((channel: any) => (
                    {...channel, members: (channel.members as any[] || []).map(member => 
                        toEdit.includes(member.id) ? (payload.data as any[]).find(i => i.id === member.id) : member)
                    }
                ));
            } else {
                return array.map((channel: any) => {
                    return {...channel, members: (channel.members as any[] || []).map(member => ((payload.data as Data).id === member.id) ? payload.data : member)}
                })
            }
        default:
            return array;
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
