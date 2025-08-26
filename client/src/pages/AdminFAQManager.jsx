import React, { useEffect, useState } from 'react';

const AdminFAQManager = ({ currentUser }) => {
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Block non-admins
if (!currentUser || (!currentUser.role && !currentUser.isAdmin)) {
  return <div>403 - Access Denied</div>;
}


  // 📥 Load FAQs
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/chat/faqs');
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // ➕ Add FAQ
  const handleAdd = async () => {
    try {
      const updatedFaqs = [...faqs, newFaq];
      await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFaqs)
      });
      setNewFaq({ question: '', answer: '', category: '' });
      fetchFaqs();
    } catch (err) {
      console.error('Failed to add FAQ:', err);
    }
  };

  // ✏️ Save Edit
  const handleSave = async () => {
    try {
      await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqs)
      });
      setEditingIndex(null);
      fetchFaqs();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    }
  };

  // ❌ Delete FAQ
  const handleDelete = async (index) => {
    try {
      const updatedFaqs = faqs.filter((_, i) => i !== index);
      await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFaqs)
      });
      fetchFaqs();
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📚 Admin FAQ Manager</h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border p-4 rounded shadow-sm">
            {editingIndex === index ? (
              <>
                <input
                  className="w-full mb-2"
                  value={faq.question}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, question: e.target.value } : f))
                    )
                  }
                />
                <textarea
                  className="w-full mb-2"
                  value={faq.answer}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, answer: e.target.value } : f))
                    )
                  }
                />
                <input
                  className="w-full mb-2"
                  value={faq.category || ''}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, category: e.target.value } : f))
                    )
                  }
                />
                <button onClick={handleSave} className="btn btn-primary mr-2">💾 Save</button>
                <button onClick={() => setEditingIndex(null)} className="btn btn-secondary">Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Q:</strong> {faq.question}</p>
                <p><strong>A:</strong> {faq.answer}</p>
                <p><strong>Category:</strong> {faq.category || '—'}</p>
                <button onClick={() => setEditingIndex(index)} className="btn btn-outline mr-2">✏️ Edit</button>
                <button onClick={() => handleDelete(index)} className="btn btn-error">🗑️ Delete</button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">➕ Add New FAQ</h3>
        <input
          className="w-full mb-2"
          placeholder="Question"
          value={newFaq.question}
          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
        />
        <textarea
          className="w-full mb-2"
          placeholder="Answer"
          value={newFaq.answer}
          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
        />
        <input
          className="w-full mb-2"
          placeholder="Category (optional)"
          value={newFaq.category}
          onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
        />
        <button onClick={handleAdd} className="btn btn-success">➕ Add FAQ</button>
      </div>
    </div>
  );
};

export default AdminFAQManager;
