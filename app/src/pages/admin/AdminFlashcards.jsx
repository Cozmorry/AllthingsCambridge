import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, ChevronDown, ChevronRight, BookMarked } from 'lucide-react'

const AdminFlashcards = () => {
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [decks, setDecks] = useState([])
    const [selectedDeck, setSelectedDeck] = useState(null)
    const [cards, setCards] = useState([])
    const [deckForm, setDeckForm] = useState({ subject_id: '', topic_id: '', title: '', is_premium: false })
    const [cardForm, setCardForm] = useState({ front: '', back: '' })
    const [savingDeck, setSavingDeck] = useState(false)
    const [savingCard, setSavingCard] = useState(false)

    useEffect(() => {
        supabase.from('subjects').select('id,name').order('name').then(({ data }) => setSubjects(data ?? []))
        loadDecks()
    }, [])

    useEffect(() => {
        if (!deckForm.subject_id) return setTopics([])
        supabase.from('topics').select('id,name').eq('subject_id', deckForm.subject_id).then(({ data }) => setTopics(data ?? []))
    }, [deckForm.subject_id])

    const loadDecks = async () => {
        const { data } = await supabase.from('flashcard_decks').select('*, subjects(name), topics(name)').order('created_at', { ascending: false })
        setDecks(data ?? [])
    }

    const loadCards = async (deckId) => {
        const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).order('order')
        setCards(data ?? [])
    }

    const selectDeck = (deck) => {
        setSelectedDeck(deck)
        loadCards(deck.id)
    }

    const addDeck = async (e) => {
        e.preventDefault()
        setSavingDeck(true)
        await supabase.from('flashcard_decks').insert({ ...deckForm, topic_id: deckForm.topic_id || null })
        await loadDecks()
        setDeckForm({ subject_id: '', topic_id: '', title: '', is_premium: false })
        setSavingDeck(false)
    }

    const addCard = async (e) => {
        e.preventDefault()
        if (!selectedDeck) return
        setSavingCard(true)
        await supabase.from('flashcards').insert({ ...cardForm, deck_id: selectedDeck.id, order: cards.length })
        // update card count
        await supabase.from('flashcard_decks').update({ card_count: cards.length + 1 }).eq('id', selectedDeck.id)
        await loadCards(selectedDeck.id)
        setCardForm({ front: '', back: '' })
        setSavingCard(false)
    }

    const deleteCard = async (id) => {
        await supabase.from('flashcards').delete().eq('id', id)
        setCards(c => c.filter(x => x.id !== id))
    }

    const deleteDeck = async (id) => {
        await supabase.from('flashcard_decks').delete().eq('id', id)
        if (selectedDeck?.id === id) setSelectedDeck(null)
        await loadDecks()
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Flashcards</h1>
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Deck list */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">Decks</h2></div>
                    <div className="overflow-y-auto max-h-[400px]">
                        {decks.map(d => (
                            <div key={d.id} onClick={() => selectDeck(d)} className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer group transition-colors ${selectedDeck?.id === d.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                                <BookMarked size={16} className={selectedDeck?.id === d.id ? 'text-primary-600' : 'text-gray-400'} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{d.title}</p>
                                    <p className="text-xs text-gray-400">{d.subjects?.name} · {d.card_count ?? 0} cards</p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); deleteDeck(d.id) }} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {/* New deck form */}
                    <form onSubmit={addDeck} className="p-4 border-t border-gray-100 space-y-3">
                        <p className="text-xs font-bold text-gray-500 uppercase">New Deck</p>
                        <select required value={deckForm.subject_id} onChange={e => setDeckForm(f => ({ ...f, subject_id: e.target.value, topic_id: '' }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white">
                            <option value="">Select subject…</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {topics.length > 0 && (
                            <select value={deckForm.topic_id} onChange={e => setDeckForm(f => ({ ...f, topic_id: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white">
                                <option value="">No topic</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}
                        <input required value={deckForm.title} onChange={e => setDeckForm(f => ({ ...f, title: e.target.value }))} placeholder="Deck title"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-400" />
                        <button type="submit" disabled={savingDeck} className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60">
                            {savingDeck ? 'Creating…' : '+ Create Deck'}
                        </button>
                    </form>
                </div>

                {/* Cards column */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {!selectedDeck ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                            <BookMarked size={40} className="mb-3 opacity-20" />
                            <p>Select a deck to manage its cards</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-gray-900">{selectedDeck.title}</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">{cards.length} cards</p>
                                </div>
                            </div>

                            {/* Add card form */}
                            <form onSubmit={addCard} className="p-5 border-b border-gray-100 space-y-3">
                                <p className="text-xs font-bold text-gray-500 uppercase">Add Card</p>
                                <textarea required value={cardForm.front} onChange={e => setCardForm(f => ({ ...f, front: e.target.value }))} placeholder="Front (question)" rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
                                <textarea required value={cardForm.back} onChange={e => setCardForm(f => ({ ...f, back: e.target.value }))} placeholder="Back (answer)" rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
                                <button type="submit" disabled={savingCard} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60">
                                    {savingCard ? 'Adding…' : <span className="flex items-center gap-1.5"><Plus size={15} /> Add Card</span>}
                                </button>
                            </form>

                            {/* Cards list */}
                            <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-50">
                                {cards.map((c, i) => (
                                    <div key={c.id} className="flex gap-3 px-5 py-4 group">
                                        <span className="text-xs text-gray-300 font-bold mt-1 w-5 shrink-0">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 mb-1">{c.front}</p>
                                            <p className="text-sm text-gray-500">{c.back}</p>
                                        </div>
                                        <button onClick={() => deleteCard(c.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 shrink-0">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminFlashcards
