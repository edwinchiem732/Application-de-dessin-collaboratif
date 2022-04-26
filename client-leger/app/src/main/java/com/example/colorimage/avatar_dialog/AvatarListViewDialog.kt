package com.example.colorimage.avatar_dialog

import android.app.Activity
import android.app.AlertDialog
import android.app.Dialog

import android.os.Bundle

import android.view.View
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.colorimage.R


class AvatarListViewDialog(var activity: Activity, internal var adapter: RecyclerView.Adapter<*>) :
    AlertDialog(activity),
    View.OnClickListener {

    var dialog: Dialog? = null

    internal var mRecyclerView: RecyclerView? = null
    private var mLayoutManager: RecyclerView.LayoutManager? = null


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.avatar_dialog_layout)

        mRecyclerView = findViewById(R.id.avatar_recycler_view)
        mLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.HORIZONTAL, false)

        mRecyclerView?.layoutManager = mLayoutManager
        mRecyclerView?.adapter = adapter
    }

    override fun onClick(v: View) {
        dismiss()
    }
}