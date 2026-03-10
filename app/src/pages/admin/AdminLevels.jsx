import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminCRUD from '../../components/admin/AdminCRUD'

const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'slug', label: 'Slug', type: 'text', required: true, help: 'e.g. igcse (URL-friendly, no spaces)' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '🎓' },
    { key: 'order', label: 'Display Order', type: 'number', placeholder: '1' },
]

const AdminLevels = () => <AdminCRUD table="levels" title="Levels" fields={fields} />
export default AdminLevels
