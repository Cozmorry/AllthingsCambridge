import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminCRUD from '../../components/admin/AdminCRUD'

const AdminTopics = () => {
    const [subjectOptions, setSubjectOptions] = useState([])
    useEffect(() => {
        supabase.from('subjects').select('id,name').order('name').then(({ data }) => {
            setSubjectOptions((data ?? []).map(s => ({ value: s.id, label: s.name })))
        })
    }, [])

    const fields = [
        { key: 'subject_id', label: 'Subject', type: 'select', required: true, options: subjectOptions },
        { key: 'name', label: 'Topic Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug', type: 'text', required: true },
        { key: 'order', label: 'Order', type: 'number' },
    ]

    return <AdminCRUD table="topics" title="Topics" fields={fields} select="*, subjects(name)" displayCol="name" />
}

export default AdminTopics
