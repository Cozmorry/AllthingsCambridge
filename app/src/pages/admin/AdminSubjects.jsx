import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminCRUD from '../../components/admin/AdminCRUD'

const AdminSubjects = () => {
    const [levelOptions, setLevelOptions] = useState([])
    useEffect(() => {
        supabase.from('levels').select('id,name').order('order').then(({ data }) => {
            setLevelOptions((data ?? []).map(l => ({ value: l.id, label: l.name })))
        })
    }, [])

    const fields = [
        { key: 'level_id', label: 'Level', type: 'select', required: true, options: levelOptions },
        { key: 'name', label: 'Subject Name', type: 'text', required: true },
        { key: 'slug', label: 'Slug', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'icon', label: 'Icon (emoji)', type: 'text' },
        { key: 'is_premium', label: 'Premium Only', type: 'checkbox' },
    ]

    return <AdminCRUD table="subjects" title="Subjects" fields={fields} select="*, levels(name)" displayCol="name" />
}

export default AdminSubjects
